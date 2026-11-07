type JsonLdProps = {
  data: Record<string, unknown>;
};

/** Renders schema.org data. `<` is escaped so content cannot close the script tag. */
const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type='application/ld+json'
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    }}
  />
);

export default JsonLd;
