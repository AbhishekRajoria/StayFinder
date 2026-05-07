import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-cream min-h-[80vh] flex items-center">
      <div className="container-page text-center py-22 max-w-xl mx-auto">
        <p className="eyebrow text-ink2 mb-4">Restricted</p>
        <h1 className="font-display text-display text-ink leading-tight">
          That door isn't open to you yet.
        </h1>
        <p className="text-ink2 text-sm mt-5 leading-relaxed">
          You need a different role — or to sign in — to view this page.
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button onClick={() => navigate("/")}>Return home</Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
