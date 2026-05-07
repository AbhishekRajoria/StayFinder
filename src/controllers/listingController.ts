import { Request, Response, NextFunction } from "express";
import Listing from "../models/Listing";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middleware/authMiddleware";
import Booking from "../models/Booking";
import { v2 as cloudinary } from 'cloudinary';

export function ensureUser(req: AuthRequest) {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
  return req.user;
}

export const getListings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      search,
      location,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      bathrooms,
      propertyType,
      amenities,
      page = "1",
      limit = "12",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter object
    const filter: Record<string, any> = {};

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Location search
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Exact matches
    if (guests) filter.guests = { $gte: Number(guests) };
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);
    if (propertyType) filter.propertyType = propertyType;

    // Amenities (array contains)
    if (amenities) {
      const amenityArray = Array.isArray(amenities) ? amenities : [amenities];
      filter.amenities = { $all: amenityArray };
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === "asc" ? 1 : -1;
    const sortObj = { [String(sort)]: sortOrder as 1 | -1 };

    // Execute query with lean() for better performance
    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("host", "name avatar")
        .lean(),
      Listing.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Error in getListings:", error);
    throw new AppError(500, "Error fetching listings");
  }
};


// GET /api/listings/:id
export const getListing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await Listing.findById(req.params.id).populate("host", "name avatar");
    if (!listing) return next(new AppError(404, "Listing not found"));

    res.json({ success: true, data: { listing } });
  } catch (error) {
    next(new AppError(500, "Error fetching listing"));
  }
};

// GET /api/listings/me
export const getMyListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = ensureUser(req);
    const listings = await Listing.find({ host: user._id }).lean();
    res.json({ success: true, data: { listings } });
  } catch (error) {
    next(new AppError(500, "Error fetching user listings"));
  }
};

// POST /api/listings
export const createListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = ensureUser(req);

    if (!user.role) {
      user.role = 'host';
      await user.save();
    }


    // Extract image URLs from Cloudinary uploads
    const imageUrls =
      Array.isArray(req.files) && req.files.length > 0
        ? (req.files as Express.Multer.File[]).map((file: any) => file.path) // Cloudinary returns `file.path` as URL
        : [];

    const newListing = await Listing.create({
      ...req.body,
      images: imageUrls,
      host: user._id,
    });

    res.status(201).json({ success: true, data: { listing: newListing } });
  } catch (error) {
    console.error("CREATE LISTING ERROR:", error);
    next(new AppError(400, "Error creating listing"));
  }
};


// PUT /api/listings/:id
export const updateListing = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = ensureUser(req);

    // 1. Parse fields from multipart/form-data
    const {
      title,
      description,
      location,
      price,
      guests,
      bedrooms,
      bathrooms,
      propertyType,
      amenities,
    } = req.body;

    // 2. Find the listing
    const listing = await Listing.findOne({
      _id: req.params.id,
      host: user._id,
    });

    if (!listing) {
      return next(new AppError(404, "Listing not found or not owned by user"));
    }

    // 3. Handle image deletion
    let imagesToDelete: string[] = [];
    if (req.body.imagesToDelete) {
      try {
        imagesToDelete = typeof req.body.imagesToDelete === 'string'
          ? JSON.parse(req.body.imagesToDelete)
          : req.body.imagesToDelete;
      } catch (error) {
        imagesToDelete = [req.body.imagesToDelete];
      }
    }

    // Validate that images to delete actually exist in the listing
    const validImagesToDelete = imagesToDelete.filter(img => listing.images.includes(img));
    
    // Delete images from Cloudinary
    for (const imageUrl of validImagesToDelete) {
      try {
        // Extract public_id from the Cloudinary URL
        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${error}`);
      }
    }
    
    // Remove images from database
    listing.images = listing.images.filter(img => !validImagesToDelete.includes(img));

    // 4. Add new images from multer
    const newImageUrls = (req.files as Express.Multer.File[])?.map((file) => file.path) || [];

    if (newImageUrls.length > 0) {
      listing.images.push(...newImageUrls);
    }

    // 5. Update all fields
    listing.title = title;
    listing.description = description;
    listing.location = location;
    listing.price = parseFloat(price);
    listing.guests = parseInt(guests);
    listing.bedrooms = parseInt(bedrooms);
    listing.bathrooms = parseInt(bathrooms);
    listing.propertyType = propertyType;
    listing.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;

    await listing.save();

    res.json({
      success: true,
      data: { listing },
    });
  } catch (error) {
    console.error(error);
    next(new AppError(400, "Error updating listing"));
  }
};


// DELETE /api/listings/:id
export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = ensureUser(req);
    const deleted = await Listing.findOneAndDelete({ _id: req.params.id, host: user._id });
    if (!deleted) return next(new AppError(404, "Listing not found or not owned by user"));

    res.json({ success: true });
  } catch (error) {
    next(new AppError(400, "Error deleting listing"));
  }
};

export const getListingBookings = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;

    const bookings = await Booking.find({
      listing: listingId,
      status: { $in: ["confirmed", "pending"] }
    }).select("startDate endDate");

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching listing bookings:", error);
    res.status(500).json({ message: "Error fetching listing bookings" });
  }
};
