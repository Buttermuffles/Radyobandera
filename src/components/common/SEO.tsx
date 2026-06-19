import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
  publishedTime?: string;
  authorName?: string;
  tags?: string[];
}

const SITE_NAME = "Radyo Bandera Surallah 98.1 FM";
const DEFAULT_DESCRIPTION = "Latest news and updates from Surallah, South Cotabato, and the Philippines.";
const DEFAULT_IMAGE = "/LOGO.jpg";
const SITE_URL = "https://radyo-bandera-surallah-981-fm.vercel.app";

function websiteJsonLd(url: string, description: string, image: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    description,
    image,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/LOGO.jpg`,
    },
  };
}

function articleJsonLd(
  url: string,
  title: string,
  description: string,
  image: string,
  publishedTime: string,
  authorName: string,
  tags: string[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    image,
    url,
    datePublished: publishedTime,
    dateModified: publishedTime,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/LOGO.jpg`,
    },
    keywords: tags.join(", "),
    articleSection: "News",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  keywords,
  publishedTime,
  authorName,
  tags,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImage = image || DEFAULT_IMAGE;
  const pageUrl = url || SITE_URL;
  const pageKeywords = keywords || "Radyo Bandera, Surallah, South Cotabato, news, Philippines, radio";

  const jsonLd =
    type === "article" && publishedTime && authorName
      ? articleJsonLd(pageUrl, pageTitle, pageDescription, pageImage, publishedTime, authorName, tags || [])
      : websiteJsonLd(pageUrl, pageDescription, pageImage);

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <link rel="canonical" href={pageUrl} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_PH" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@radyobandera" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && tags && tags.length > 0 && (
        tags.map((tag) => <meta key={tag} property="article:tag" content={tag} />)
      )}
      {type === "article" && authorName && (
        <meta property="article:author" content={authorName} />
      )}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
