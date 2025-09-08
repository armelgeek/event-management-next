import Hero from '@/shared/components/atoms/hero';

export default function Home() {
  return (
    <>
      <Hero 
        title="Discover Amazing Events"
        subtitle="Find and join events that match your interests. Connect with people who share your passions."
        ctaText="Browse Events"
        ctaHref="/events"
      />
    </>
  );
}
