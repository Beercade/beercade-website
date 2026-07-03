import type { FaqItem } from "./Faq";

// Single source of truth for FAQ content. Consumed by the /faq page (all
// entries) and the homepage teaser (first few of `visiting`).
//
// Every fact here traces to confirmed copy elsewhere on the site: the
// functions page (tokens, pricing, food, hours, contacts), the home stat strip
// (32 machines, $2 a play — signed off 11 Jun 2026), the contact page
// (parking), and the under-18s rule (John, 4 Jul 2026). Anything still in
// [square brackets] renders in the muted "to confirm" style — currently none.

export const visiting: FaqItem[] = [
  {
    q: "Where are you?",
    a: "Regent Street, Redfern. Two minutes' walk from Redfern Station, turn left out of the gate. If you've hit the wine bars, you've gone too far.",
  },
  {
    q: "What is this place, exactly?",
    a: "A bar with working arcade and pinball machines in it. Cold beer, low lights, the Godzilla LE, and about 30 other machines. You drink, you play, you lose six straight games of Street Fighter II to your mate Dave. It's a pub night that happens to have something to do.",
  },
  {
    q: "Do I need to book?",
    a: "No. Walk in, grab a table, grab a beer. Booking is for functions and big groups; for a normal Thursday, just turn up.",
  },
  {
    q: "Is there a cover charge?",
    a: "No cover. The machines take tokens; the door doesn't take anything.",
  },
  {
    q: "When are you open?",
    a: "Wednesday to Saturday, 3pm to midnight. Sunday, 3pm to 10pm. The crowd lands from about 5pm and builds through the evening.",
  },
  {
    q: "How much does it cost to play?",
    a: "Most games are $2, or two tokens a play. Grab tokens at the bar; buy them in bulk and they go further.",
  },
  {
    q: "Do the machines actually work?",
    a: "Yes. They're maintained properly and most of them are older than the staff. If one won't behave, tell the bar; we'll fix it in five minutes or give you the tokens back. Don't kick it.",
  },
  {
    q: "What machines have you got?",
    a: "The lineup rotates. Always in: the Godzilla LE, Street Fighter II, Pac-Man, the Daytona twin-seater, and about 30 others across pinball and arcade. Ask at the bar what's currently on the floor, or check the machines page.",
  },
  {
    q: "Is there food?",
    a: "The bar does toasties and a range of chips. For anything more, order in; plenty of the neighbours deliver straight to us. Pizza from La Coppola, burgers from Huxtaburger, ramen from Rara Ramen.",
  },
  {
    q: "Can I bring kids?",
    a: "Until 10pm, yes, with a responsible adult, family or guardian. After 10pm it's adults only. The machines are great; the room still isn't built for a kids' party.",
  },
  {
    q: "Is it any good for a date?",
    a: "Better than another dinner. Low lights, something to do with your hands, and you find out fast whether they're a gracious loser. Jess and Tom found us on Instagram and didn't book a restaurant again.",
  },
  {
    q: "Can I get there without driving?",
    a: "The train. Two minutes from Redfern Station. Street parking on Regent and the surrounding streets is limited on Friday and Saturday nights if you must drive, but the whole point is you can have the long pour and still get home.",
  },
  {
    q: "Do you take walk-in groups?",
    a: "Small ones, sure. Once you're at the size where someone's organising it, book a function instead; the room gets held and the tokens are sorted before you arrive. See below.",
  },
];

export const functions: FaqItem[] = [
  {
    q: "How do I enquire?",
    a: "Use the [form on the functions page](/functions#enquire) with your date, rough headcount, and the occasion. You'll get a real reply with a held window and a full breakdown, not a form letter. Prefer to talk? Call Roger on 0400 112 445.",
  },
  {
    q: "What does it cost?",
    a: "Per head: **$50** gets 25 tokens and 2 drink tickets; most groups book this. The same $50 gets 60 tokens with no drinks, or $60 gets 35 tokens and 3 drink tickets. Or buy tokens in one lump and let guests help themselves. Holding the room is usually free; the only time you pay to hire is closing a trading night to your group, at $750 an hour. You'll get the full breakdown in writing before you commit to anything.",
  },
  {
    q: "What's included?",
    a: "A held room, a bag of tokens per guest, drinks sorted, and food ordered in. Tokens you don't burn go home with you; they never expire. Drink tickets are spent on the night; one ticket gets any drink except cocktails, which are two.",
  },
  {
    q: "Do you do exclusive venue hire?",
    a: "Yes. Closing a trading night to your group is $750 an hour. A weekday daytime, or any slot outside our normal trading, usually costs nothing to hold.",
  },
  {
    q: "How far ahead should I book?",
    a: "Two to four weeks is normal. Popular dates and Friday/Saturday windows go earlier. If your date's flexible, a midweek booking is easier to lock and the room's all yours.",
  },
  {
    q: "Can I see what other groups have done?",
    a: "Yes; there are photos of real function nights on the Beercade Instagram. Real groups, real Thursday-night room, no stock models pretending to play.",
  },
  {
    q: "What's the run of a function night?",
    a: "You arrive to a reserved room and machines ready to go. People drift between the tables and the bar; nobody's herded through an agenda. The last group of 18 we hosted left at 11:45 swearing it was the best birthday they'd been to.",
  },
  {
    q: "What if I need to change the numbers or the date?",
    a: "Tell us as early as you can. Date changes depend on availability; we'd rather sort it than have you stress about it.",
  },
];
