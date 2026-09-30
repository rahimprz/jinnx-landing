# Jinnx Book Press: Publish Your Book landing page

A standalone landing page for Jinnx Book Press, kept separate from the main website. It is a single static page plus one small serverless function for the lead forms.

## What's here

| Path | What it is |
| --- | --- |
| `index.html` | The whole page: HTML, CSS and JavaScript in one file. Animations load GSAP from cdnjs. |
| `assets/` | The logo and the five real book covers shown on the page. |
| `api/lead.js` | Receives every lead form and forwards it to the Jinnx inquiries API. |

## Lead forms

The page has six forms that all collect the same fields (name, email, phone, optional message):

- the hero form
- the form in the last section
- four popups: a banner from the top, cards from the right and left, and a sheet from the bottom

Each form posts to `/api/lead`. That function checks the fields and then forwards the lead to `https://jinnxbookpress.com/api/inquiries`. The lead lands in the same `inquiries` table as the main site's contact forms, with:

- `service` set to `landing-page`
- `source_page` set to the page URL plus the form it came from, for example `[heroLead]` or `[bottomLead]`

To send leads somewhere else, set an `INQUIRY_ENDPOINT` environment variable in the hosting project.

If forwarding fails, the visitor sees a message asking them to try again, call, or email. Their typed details stay in the form, so no lead is silently lost. A hidden `company` field filters out simple spam bots.

## Popups

- **Top banner:** after about 12 seconds.
- **Right card:** once the visitor is about a quarter of the way down the page.
- **Left card:** a little past halfway down.
- **Bottom sheet:** when the visitor moves to leave (desktop), reaches the end of the page, or after about 75 seconds.

Rules that keep them from getting in the way:

- Only one shows at a time, at least 15 seconds apart.
- Each shows once per visit, and never while the main form is on screen or someone is typing.
- None show after the visitor has sent their details.
- Side cards close on their own after 30 seconds if ignored.

## Deploying on Vercel

1. Import this repository as a new Vercel project. No framework preset or build command is needed.
2. Optional: add `INQUIRY_ENDPOINT` under Environment Variables.
3. Deploy. The page is served at `/` and the form handler at `/api/lead`.

Other static hosts can serve `index.html` and `assets/` as they are, but `api/lead.js` needs a Node serverless runtime. On a different host, port that one function.
