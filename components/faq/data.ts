import type { FaqItem } from "./Faq";

// Single source of truth for FAQ content. Consumed by the /faq page (all
// entries) and the homepage teaser (first few of `visiting`).
//
// NOTE for the consultant: anything in [square brackets] is a real-world fact
// that wasn't in the brand guide — opening hours, phone, exact function
// pricing, food offer. They render in a muted "to confirm" style. Drop in the
// real numbers before this goes live.

export const visiting: FaqItem[] = [
  {
    q: "Where are you?",
    a: "Regent Street, Redfern. Two minutes' walk from Redfern Station, turn left out of the gate. If you've hit the wine bars, you've gone too far.",
  },
  {
    q: "What is this place, exactly?",
    a: "A bar with working arcade and pinball machines in it. Cold beer, low lights, the Godzilla LE, and about [XX] other machines. You drink, you play, you lose six straight games of Street Fighter II to your mate Dave. It's a pub night that happens to have something to do.",
  },
  {
    q: "Do I need to book?",
    a: "No. Walk in, grab a table, grab a beer. Booking is for functions and big groups; for a normal Thursday, just turn up.",
  },
  {
    q: "Is there a cover charge?",
    a: "No cover. The machines take credits; the door doesn't take anything.",
  },
  {
    q: "When are you open?",
    a: "[Open Tues–Sun, hours TBC — insert real trading hours.] Pinball Night runs [day/time]. The crowd lands from about 5pm and builds through the evening.",
  },
  {
    q: "How much does it cost to play?",
    a: "[$X per credit / $X for a card.] Some machines are set to free play on [night]; check the card on the cabinet.",
  },
  {
    q: "Do the machines actually work?",
    a: "Yes. They're maintained properly and most of them are older than the staff. If one won't behave, tell the bar; we'll fix it in five minutes or refund the credit. Don't kick it.",
  },
  {
    q: "What machines have you got?",
    a: "The lineup rotates. Always in: the Godzilla LE, Street Fighter II, Pac-Man, [Daytona twin-seater], and [XX] others across pinball and arcade. Dave drives in from out of area for [specific machine]; ask at the bar what's currently on the floor.",
  },
  {
    q: "Is there food?",
    a: "[Confirm food offer — kitchen menu / platters / pies, etc.] At minimum there's a starter platter on the function menu.",
  },
  {
    q: "Can I bring kids?",
    a: "No. Beercade is licensed and the crowd is mid-thirties and up. The machines are great; the room isn't built for a kids' party.",
  },
  {
    q: "Is it any good for a date?",
    a: "Better than another dinner. Low lights, something to do with your hands, and you find out fast whether they're a gracious loser. Jess and Tom found us on Instagram and didn't book a restaurant again.",
  },
  {
    q: "Can I get there without driving?",
    a: "The train. Two minutes from Redfern Station. There's [limited street parking / no dedicated parking] if you must drive, but the whole point is you can have the long pour and still get home.",
  },
  {
    q: "Do you take walk-in groups?",
    a: "Small ones, sure. Once you're past [8–10] people on a busy night, do yourself a favour and book the back room; see below.",
  },
];

export const functions: FaqItem[] = [
  {
    q: "How do I enquire?",
    a: "Email hello@beercade.com.au with your date, rough headcount, and the occasion. You'll get a real reply with a held window and a full breakdown, not a form letter. Or call 0400 112 445.",
  },
  {
    q: "How big a group can you take?",
    a: "The back room comfortably holds [XX–XX]. It's got four pinball tables and the Daytona twin-seater in it, so the group isn't queuing for one machine all night. Larger than that, ask; we'll tell you honestly whether it works.",
  },
  {
    q: "What does it cost?",
    a: "As a guide: a group of 18 lands at about **$40 a head** with a starter platter and a four-hour drinks tab. Final number depends on headcount, food, and how long the bar's open. You'll get the full breakdown in writing before you commit to anything.",
  },
  {
    q: "What's included?",
    a: "[Confirm inclusions:] the back room reserved for your window, [X] machines on free play for the group, a starter platter, and a drinks tab to your nominated limit. Add-ons — [extra catering, longer tab, exclusive use] — on request.",
  },
  {
    q: "Do you do exclusive venue hire?",
    a: "[Yes/No — confirm.] For most groups the back room is enough and the rest of the venue stays open. Whole-venue hire is possible on [quieter nights]; ask early.",
  },
  {
    q: "How far ahead should I book?",
    a: "Two to four weeks is normal. Popular dates and Friday/Saturday windows go earlier. If your date's flexible, a midweek booking is easier to lock and the room's all yours.",
  },
  {
    q: "Is there a deposit?",
    a: "[Yes — $X or X% to hold the date, applied to your final bill. Confirm terms.] The held window stays yours once the deposit's in.",
  },
  {
    q: "Can you cater for dietaries?",
    a: "[Confirm.] Tell us when you enquire — vegetarian, vegan, gluten-free, allergies — and it's handled on the platter and any add-on food.",
  },
  {
    q: "Can I see what other groups have done?",
    a: "Yes; there are photos of real function nights on [Instagram / the functions page]. Real groups, real Thursday-night room, no stock models pretending to play.",
  },
  {
    q: "What's the run of a function night?",
    a: "You arrive to a reserved room and machines ready to go. People drift between the tables and the bar; nobody's herded through an agenda. The last group of 18 we hosted left at 11:45 swearing it was the best birthday they'd been to.",
  },
  {
    q: "Can I bring a cake / decorations?",
    a: "[Confirm policy.] A cake's usually fine. Keep decorations off the machines; they're working equipment, not props.",
  },
  {
    q: "What if I need to change the numbers or the date?",
    a: "Tell us as early as you can. Headcount can flex up to [X days] out; date changes depend on availability. We'd rather sort it than have you stress about it.",
  },
];
