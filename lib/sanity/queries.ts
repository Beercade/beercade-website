export const homepageQuery = /* groq */ `*[_type == "homepage"][0]{
  heroHeadline, heroSubline, primaryCtaLabel, primaryCtaTarget,
  "heroSlides": heroSlides[]{
    _key, mediaType, videoUrl,
    "videoFileUrl": videoFile.asset->url,
    "image": image{ ..., "alt": alt, asset->{ _id, url, metadata{ lqip, dimensions } } }
  },
  heroVideoUrl, heroPoster,
  "featuredMachines": featuredMachines[]->{ _id, name, slug, type, photo, status, logoBackground },
  "featuredEvents": featuredEvents[]->{ _id, title, slug, kicker, kind, startDate, status, hero }
}`;

export const machineCountQuery = /* groq */ `count(*[_type == "machine"])`;

export const allMachinesQuery = /* groq */ `*[_type == "machine"] | order(order asc, name asc){
  _id, name, slug, type, manufacturer, year, status, photo, description, logoBackground
}`;

export const machineBySlugQuery = /* groq */ `*[_type == "machine" && slug.current == $slug][0]{
  ..., highScore
}`;

export const upcomingEventsQuery = /* groq */ `*[_type == "event" && status in ["upcoming","live"]] | order(startDate asc){
  _id, title, slug, kicker, kind, startDate, endDate, recurring, entry, prize, status, hero
}`;

export const eventBySlugQuery = /* groq */ `*[_type == "event" && slug.current == $slug][0]{
  ..., "machines": machines[]->{ _id, name, slug, photo }
}`;

export const openingHoursQuery = /* groq */ `*[_type == "openingHours"][0]`;

export const whatsOnQuery = /* groq */ `*[_type == "whatsOn"] | order(order asc, dayOfWeek asc)`;

export const functionPackagesQuery = /* groq */ `*[_type == "functionPackage"] | order(order asc){
  _id, name, bestFor, tagline, groupSize, price, priceNote, inclusions, toHold, pitch, featured
}`;

export const menuSectionsQuery = /* groq */ `*[_type == "menuSection"] | order(order asc, title asc){
  _id, title, side, note, footnotes,
  "groups": groups[]{ _key, heading, "items": items[]{ _key, name, description, price } }
}`;

export const homepageTestimonialsQuery = /* groq */ `*[_type == "testimonial" && "home" in useOn][0..2]`;

export const functionTestimonialsQuery = /* groq */ `*[_type == "testimonial" && "functions" in useOn][0..5]`;
