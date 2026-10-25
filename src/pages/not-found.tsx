import { HoverButton } from "@/components/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-3xl flex-col items-start justify-center px-5 py-24">
      <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">404 · No rows returned</p>
      <h1 className="font-display mt-4 text-5xl font-extrabold md:text-7xl">This page never made it <span className="font-serif font-normal italic text-primary">into the pipeline.</span></h1>
      <div className="mt-10 flex flex-wrap gap-3">
        <HoverButton href="/" testId="button-404-home">Back home</HoverButton>
        <HoverButton href="/work" variant="line" testId="button-404-work">See the work</HoverButton>
      </div>
    </div>
  );
}
