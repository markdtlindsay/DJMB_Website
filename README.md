# DJ Marky Boy Website

This repository contains the source for the DJ Marky Boy website: a single-page promotional site with an animated launch experience, upcoming gigs feed, social links, and modal-based detail panels.

## What's included

- A landing page for DJ Marky Boy with branding, social links, and an upcoming gigs section
- A maintenance / launch gate for taking the site offline when needed
- A Netlify Function that reads an ICS calendar feed and converts future events into JSON
- Responsive styling tuned for desktop and mobile, including compact upcoming gig cards with a details modal

## Project structure

- `index.html`
  The main page markup for the live site, maintenance view, modals, and social links.
- `assets/`
  Images, icons, and CSS files used by the site.
- `scripts/`
  Frontend JavaScript for page behaviour, maintenance gate logic, ambient effects, celebration effects, and gig rendering.
- `netlify/functions/gigs.js`
  Serverless function that fetches and parses the calendar feed for upcoming gigs.
- `netlify.toml`
  Netlify configuration pointing functions to the `netlify/functions` directory.

## Upcoming gigs

Upcoming gigs are loaded from the Netlify function at `/.netlify/functions/gigs`.

That function:

- reads the `GIGS_ICS_URL` environment variable
- fetches an ICS calendar feed
- parses future `VEVENT` entries
- returns a JSON payload with title, start date/time, venue, and description

On the frontend, the gigs section displays:

- compact gig cards in the main list
- date and time first for quick scanning
- a click / tap modal for the full venue and event details

## Local development

This project is a static site plus a Netlify Function.

If you open the site locally without the Netlify environment, the gigs feed may not work unless `GIGS_ICS_URL` is also configured locally and the site is run through Netlify dev tooling.

Important:

- production gigs rely on the `GIGS_ICS_URL` environment variable
- local file-only testing may not reflect live behaviour for the gigs section

## Deployment

The site is intended to be deployed with Netlify.

Deployment requirements:

- the site files in this repository
- the Netlify function in `netlify/functions/gigs.js`
- a configured `GIGS_ICS_URL` environment variable in Netlify

## Notes

- The site includes Google Analytics via the tag configured in `index.html`
- The gigs UI has been tuned for compact responsive display, especially on smaller screens
- Maintenance copy is configured in `scripts/celebration.js` via the `MAINTENANCE_MODE` object
- Open the maintenance control panel with `?maintenanceDev=1`
- Public live or maintenance state is stored by `netlify/functions/site-mode.js`
- Set `MAINTENANCE_ADMIN_TOKEN` in Netlify to protect public mode changes
- Optionally set `SITE_MODE_DEFAULT` to `live` or `maintenance` for the initial public mode
- Launch celebration effects stay active for 7 days from `DEFAULT_LAUNCH_AT`
- If needed, repository history can be squashed after a final tidy commit for a cleaner public project history
