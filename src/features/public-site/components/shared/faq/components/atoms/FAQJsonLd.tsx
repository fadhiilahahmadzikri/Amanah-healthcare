import type { HealthcareFAQJsonLd } from '../../types';

type FAQJsonLdProps = {
  schema: HealthcareFAQJsonLd;
};

export function FAQJsonLd({ schema }: FAQJsonLdProps) {
  return (
    <script
      type='application/ld+json'
      // eslint-disable-next-line react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replaceAll('<', '\\u003c')
      }}
    />
  );
}
