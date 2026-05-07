import { format } from "date-fns";
import { Link } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/editorial";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container-page py-32 text-center">
        <p className="eyebrow text-ink2 mb-4">Sign in needed</p>
        <h1 className="font-display text-display text-ink">Your profile waits.</h1>
        <Button asChild className="mt-8">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  const memberSince = user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "—";

  return (
    <div className="bg-cream min-h-screen">
      <section className="container-page pt-12 md:pt-20 pb-12">
        <p className="eyebrow text-ink2 mb-4">Profile</p>
        <div className="flex items-center gap-6 flex-wrap">
          <Avatar className="h-24 w-24 border border-linen">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-bone text-ink font-display text-3xl">
              {user.name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-display text-display text-ink leading-tight">
              {user.name}
            </h1>
            <p className="text-ink2 text-sm mt-2">
              {user.role === "host" ? "Host" : "Guest"} · Member since {memberSince}
            </p>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <Section title="Identity" eyebrow="01">
          <Field label="Full name" value={user.name} />
          <Field label="Member since" value={memberSince} />
          <Field label="Role" value={user.role === "host" ? "Host" : "Guest"} />
        </Section>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Section title="Contact" eyebrow="02">
          <Field label="Email" value={user.email} />
          <Field label="Phone" value={(user as any).phone ?? "Not provided"} />
        </Section>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <Section title="Hosting" eyebrow="03">
          {user.role === "host" ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
              <p className="text-ink2 text-sm leading-relaxed max-w-md">
                You're hosting on StayFinder. Manage your listings and respond to guests
                from your atelier.
              </p>
              <Button asChild variant="outline">
                <Link to="/my-listings">Manage listings</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
              <p className="text-ink2 text-sm leading-relaxed max-w-md">
                Want to open your home to thoughtful travellers? Becoming a host takes
                a few minutes.
              </p>
              <Button asChild>
                <Link to="/listings/create">Become a host</Link>
              </Button>
            </div>
          )}
        </Section>
      </ScrollReveal>

      <div className="container-page pb-22" />
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-page border-t border-linen py-12 md:py-14">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12">
        <div className="md:col-span-3">
          <p className="eyebrow text-ink2 mb-2">{eyebrow}</p>
          <h2 className="font-display text-2xl text-ink">{title}</h2>
        </div>
        <div className="md:col-span-9 divide-y divide-linen">{children}</div>
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-5">
      <span className="eyebrow text-ink2">{label}</span>
      <span className="text-ink text-base text-right">{value}</span>
    </div>
  );
}
