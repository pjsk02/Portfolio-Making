# Portfolio experience: research and implementation

## Direction

The strongest differentiator is the actual progression from analysis to
manufacturing data engineering to applied AI—not a generic claim to be
“innovative.” The website should make that progression easy to understand,
then give the visitor evidence and a reason to keep reading.

Curiosity should not make hiring information hard to find. Résumé, contact,
work, and the strongest case study remain directly accessible.

## How the story works

1. **Introduction:** a real portrait and a concise statement of the progression.
2. **Career chapters:** each station explains what changed and what carried
   forward. The active chapter and next-station links maintain orientation.
3. **Evidence:** the anonymous retrieval-system case answers “what changed for
   the team?” The months-to-days outcome refers to processing and cleaning,
   not query latency; it is a user-reported outcome, not an independent benchmark.
4. **Workshop:** one distinctive, optional interaction illustrates task
   separation and human review. It is not a live AI service or a diagram of
   the client's actual architecture.
5. **Projects and research:** existing work provides depth without requiring
   every visitor to read every case. Direct contact is available throughout.

These are design hypotheses informed by established usability principles,
not measured claims of improved engagement or hiring conversion.

## What the references contributed

- **Personal Portfolio Website Animations:** pacing and restraint; motion
  should clarify changes rather than decorate every element.
  https://dribbble.com/shots/26995447-Personal-Portfolio-Website-Animations
- **Personal Portfolio Website Design:** a personal portrait, clear typographic
  hierarchy, and generous negative space.
  https://dribbble.com/shots/24978876-Personal-Portfolio-Website-Design
- **Landing Designer portfolio:** expressive sans/serif contrast and a
  controlled accent within a dark palette.
  https://dribbble.com/shots/19871911-Landing-Designer-portfolio
- **Alexfolio:** personal identity and project evidence before visual effects.
  https://dribbble.com/shots/26873011-Free-Alexfolio-Portfolio-template
- **Linear:** coherent chapters, clear navigation, and a concrete product view
  supporting the headline. The lesson is hierarchy and proof, not copying its
  visual style or assuming its conversion performance.
  https://linear.app/
- **Bruno Simon:** an exploratory interaction reference, not a performance
  model for this portfolio. The inspected first-load capture was still in an
  intro state; it was not a full interaction or resource-usage evaluation.
  https://bruno-simon.com/

The supplied “AI slop” document is useful as a craft checklist: avoid fabricated
proof, inconsistent spacing, unrelated effects, weak contrast, and incomplete
controls. It is not a reliable method of determining whether AI wrote code.
No font, gradient, or color by itself proves that a website is AI-generated.

https://docs.google.com/document/d/e/2PACX-1vTnLEdwSF1HPkuwOkuNneXGCaQAw5N2nnRf7cX_B4zuBLf2VTMi4Yh59gqS-eeVqYpa11iFQYmRjVBW/pub

## Motion, accessibility, and visitor control

- A shared visibility observer drives one-time reveals and pauses offscreen
  ambient/workshop motion. Hidden tabs also pause animation.
- Continuous motion uses small SVG elements and CSS transforms/opacity.
  There is no WebGL scene, video background, animation library, or per-frame
  JavaScript simulation.
- The visible pause control stops decorative motion and reveal transitions.
  System reduced-motion preferences take priority.
- Theme preferences follow the operating system until the visitor makes an
  explicit choice. Storage failures are handled without breaking the page.
- Native radio controls, a review switch, a skip link, visible focus indicators,
  44px controls, and direct section links support keyboard navigation.
- Initial deep links jump to their destination; smooth scrolling is reserved
  for visitor-initiated navigation when motion is enabled.
- Core text/background token pairs were checked in both themes and exceed
  4.5:1 contrast. This is not a claim of full WCAG certification.

Primary guidance:

- Progressive disclosure: https://www.nngroup.com/articles/progressive-disclosure/
- Animation performance: https://web.dev/articles/animations-guide
- Pause, stop, hide: https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html

## Measured delivery changes

| Asset | Previous | Updated |
| --- | ---: | ---: |
| CSS, production build | 255.39 kB | about 44 kB |
| CSS, gzip | 35.73 kB | about 8.7 kB |
| JavaScript, gzip | 77.81 kB | about 84 kB |
| Hero portrait, original | 1,189,233 bytes | preserved as source only |
| Hero portrait, desktop WebP | — | 236,586 bytes |
| Hero portrait, mobile WebP | — | 72,184 bytes |

The extra interface behavior adds about 6 kB of compressed JavaScript.
CSS is about 83% smaller uncompressed; portrait downloads are about 80–94%
smaller. Portrait grayscale is baked into the images instead of applied as
a runtime filter. Font files are self-hosted with their licenses.

Build sizes and image sizes are measured, but whole-tab RAM, FPS on physical
devices, and conversion rates have not been benchmarked. Smaller assets and
paused offscreen work reduce overhead; they cannot guarantee zero lag on
every device.
