// components/SectionIntro.js

/**
 * SectionIntro
 *
 * Reusable section header / intro block used above content.
 * - kicker (eyebrow) text
 * - title
 * - lead / description
 * - optional image (left or right)
 * - optional children (buttons, chips, etc.)
 *
 * Usage:
 * <SectionIntro
 *   id="reader-impressions"
 *   kicker="Reader Impressions"
 *   title="Stories Made to Stay With You"
 *   lead="Readers describe the Manyagi Universe as emotionally grounded..."
 *   tone="warm"
 * />
 */

export default function SectionIntro({
  id,
  kicker,
  title,
  lead,
  align = 'center',          // 'left' | 'center'
  tone = 'plain',            // 'plain' | 'warm' | 'card' | 'neutral'
  imageSrc,
  imageAlt = '',
  imagePosition = 'right',   // 'left' | 'right'
  maxWidth = 'max-w-3xl',
  children,
  className = '',
}) {
  const hasImage = Boolean(imageSrc);

  const baseSectionClasses = [
    'w-full',
    'py-12 md:py-16',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerBase =
    'container mx-auto px-4 rounded-3xl transition-colors duration-300';

  let containerTone = '';
  if (tone === 'warm') {
    containerTone =
      'bg-gradient-to-b from-amber-50 via-amber-50/70 to-amber-100 ' +
      'dark:from-amber-900/40 dark:via-amber-900/30 dark:to-amber-900/60';
  } else if (tone === 'card') {
    containerTone =
      'bg-white/95 dark:bg-gray-950/95 border border-gray-200/70 ' +
      'dark:border-gray-800 shadow-sm';
  } else if (tone === 'neutral') {
    // ✨ New: neutral pill style used for Capital Roadmap & Catalog
    containerTone =
      'bg-gradient-to-b from-white/95 via-white/95 to-slate-50/95 ' +
      'border border-gray-200/70 dark:border-gray-800 shadow-sm';
  } else {
    // plain
    containerTone = 'bg-transparent';
  }

  const layoutClasses = [
    'flex flex-col gap-10 md:gap-12 py-8 md:py-10',
    hasImage && 'md:flex-row md:items-center',
    hasImage && imagePosition === 'left' && 'md:flex-row-reverse',
  ]
    .filter(Boolean)
    .join(' ');

  const textAlignClasses =
    align === 'left'
      ? 'md:items-start md:text-left'
      : 'md:items-center md:text-center';

  const textBlockWidth = hasImage ? 'md:w-1/2' : 'md:w-full';

  return (
    <section id={id} className={baseSectionClasses}>
      <div className={`${containerBase} ${containerTone}`}>
        <div className={layoutClasses}>
          {/* Text column */}
          <div
            className={[
              'flex flex-col gap-4 items-center',
              textAlignClasses,
              textBlockWidth,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {kicker && (
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-amber-700/80 dark:text-amber-300/80 text-center md:text-left">
                {kicker}
              </p>
            )}

            {title && (
              <h2
                className={[
                  'text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-gray-50',
                  align === 'left' ? 'text-left w-full' : 'text-center',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {title}
              </h2>
            )}

            {lead && (
              <p
                className={[
                  'text-sm md:text-base text-gray-600 dark:text-gray-300',
                  maxWidth,
                  align === 'left' ? 'text-left' : 'text-center',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {lead}
              </p>
            )}

            {children && (
              <div
                className={[
                  'mt-4 flex flex-wrap gap-3',
                  align === 'left' ? 'justify-start' : 'justify-center',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {children}
              </div>
            )}
          </div>

          {/* Optional image column */}
          {hasImage && (
            <div
              className={[
                'md:w-1/2 flex justify-center',
                imagePosition === 'left'
                  ? 'md:justify-start'
                  : 'md:justify-end',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-lg shadow-amber-900/10 dark:shadow-black/40">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="h-full w-full object-cover transform transition-transform duration-500 hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent mix-blend-multiply opacity-70" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
