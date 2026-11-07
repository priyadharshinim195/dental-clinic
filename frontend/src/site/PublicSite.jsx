import { useEffect } from "react";

import CaseStudies, { CaseStudiesPage } from "./CaseStudies";
import Header from "./Header";
import Hero from "./Hero";
import Preloader, { usePreloaderGate } from "./Preloader";
import { About, Connect, Contact, Footer, Gallery, Services, Testimonials, WhyChooseUs } from "./Sections";
import { ToothSymbols } from "./icons";
import {
  prefersReducedMotion, useImageReady, useReveal, useScrollState, useSiteData,
} from "./hooks";

function useDocumentSeo(settings) {
  useEffect(() => {
    if (settings.seo_title) document.title = settings.seo_title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    if (settings.seo_description) meta.content = settings.seo_description;
  }, [settings.seo_title, settings.seo_description]);
}

export default function PublicSite() {
  const data = useSiteData();
  const { settings, content, slides, publishedCases, gallery, testimonials } = data;
  const isCaseStudiesPage = /^\/case-studies\/?$/.test(window.location.pathname);
  const visible = settings.section_visibility || {};
  const show = (key) => visible[key] !== false;

  const heroReady = useImageReady(slides[0] && slides[0].url);
  const phase = usePreloaderGate(data.status !== "loading" && heroReady);
  const scroll = useScrollState();
  useDocumentSeo(settings);
  useReveal([data.status, publishedCases ? publishedCases.length : 0, JSON.stringify(visible)]);

  useEffect(() => {
    if (isCaseStudiesPage || data.status === "loading" || window.location.hash !== "#case-studies") {
      return undefined;
    }

    let secondFrame;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const section = document.getElementById("case-studies");
        if (section) {
          section.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame);
    };
  }, [data.status, isCaseStudiesPage, visible["case-studies"]]);

  useEffect(() => {
    const splash = document.getElementById("startup-splash");
    if (!splash) return undefined;
    splash.classList.add("is-ready");
    const timer = setTimeout(() => splash.remove(), 260);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ToothSymbols />
      {phase !== "gone" && <Preloader phase={phase} settings={settings} />}
      <a className="skip-link" href="#main">Skip to content</a>
      <Header settings={settings} visible={visible} heroGone={isCaseStudiesPage || scroll.heroGone}
        homePage={!isCaseStudiesPage} />
      {isCaseStudiesPage ? (
        <main id="main">
          <CaseStudiesPage content={content} publishedCases={publishedCases} />
        </main>
      ) : (
        <main id="main">
          <Hero slides={slides} content={content} settings={settings} scrolled={scroll.scrolled} />
          {show("about") && <About content={content} />}
          {show("services") && <Services content={content} />}
          {show("case-studies") && <CaseStudies content={content} publishedCases={publishedCases} limit={6} />}
          {show("why-choose-us") && <WhyChooseUs content={content} />}
          {show("connect") && <Connect content={content} settings={settings} />}
          {show("testimonials") && <Testimonials content={content} items={testimonials} />}
          {show("gallery") && <Gallery content={content} images={gallery} />}
          {show("contact") && <Contact content={content} settings={settings} />}
        </main>
      )}
      <Footer content={content} settings={settings} visible={visible} />
    </>
  );
}
