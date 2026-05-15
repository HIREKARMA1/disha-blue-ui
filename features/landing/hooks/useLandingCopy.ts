'use client'

import { useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export function useLandingCopy() {
  const { t, tArray } = useTranslation()

  return useMemo(() => {
    const stepTitles = tArray('landing.howItWorks.stepTitles')
    const stepDescs = tArray('landing.howItWorks.stepDescs')
    const steps = stepTitles.map((title, i) => ({ title, desc: stepDescs[i] ?? '' }))

    const journeyTitles = tArray('landing.journey.stepTitles')
    const journeyDescs = tArray('landing.journey.stepDescs')
    const journeySteps = journeyTitles.map((title, i) => ({ title, desc: journeyDescs[i] ?? '' }))

    const outcomeTitles = tArray('landing.outcomes.cardTitles')
    const outcomeDescs = tArray('landing.outcomes.cardDescs')
    const outcomeCards = outcomeTitles.map((title, i) => ({ title, desc: outcomeDescs[i] ?? '' }))

    const testimonialTags = tArray('landing.testimonials.tags')
    const testimonialQuotes = tArray('landing.testimonials.quotes')
    const testimonialNames = tArray('landing.testimonials.names')
    const testimonials = testimonialTags.map((tag, i) => ({
      tag,
      quote: testimonialQuotes[i] ?? '',
      name: testimonialNames[i] ?? '',
    }))

    return {
      applyBar: {
        ariaLabel: t('landing.applyBar.ariaLabel'),
        heroLabel: t('landing.applyBar.heroLabel'),
        locationSrOnly: t('landing.applyBar.locationSrOnly'),
        placeholderHero: t('landing.applyBar.placeholderHero'),
        placeholderDefault: t('landing.applyBar.placeholderDefault'),
        browseJobs: t('landing.applyBar.browseJobs'),
        applyNow: t('landing.applyBar.applyNow'),
      },
      hero: {
        kicker: t('landing.hero.kicker'),
        titleLine1: t('landing.hero.titleLine1'),
        titleEm: t('landing.hero.titleEm'),
        titleLine2: t('landing.hero.titleLine2'),
        description: t('landing.hero.description'),
        dashBrand: t('landing.hero.dashBrand'),
        stats: [
          { value: t('landing.hero.stat1Value'), labelLines: t('landing.hero.stat1Label').split('|') },
          { value: t('landing.hero.stat2Value'), labelLines: t('landing.hero.stat2Label').split('|') },
          { value: t('landing.hero.stat3Value'), labelLines: t('landing.hero.stat3Label').split('|') },
        ],
      },
      ticker: tArray('landing.ticker'),
      aiStrip: [
        { title: t('landing.aiStrip.resumeTitle'), desc: t('landing.aiStrip.resumeDesc') },
        { title: t('landing.aiStrip.interviewTitle'), desc: t('landing.aiStrip.interviewDesc') },
        { title: t('landing.aiStrip.matchingTitle'), desc: t('landing.aiStrip.matchingDesc') },
        { title: t('landing.aiStrip.coursesTitle'), desc: t('landing.aiStrip.coursesDesc') },
      ],
      illus: [
        { title: t('landing.illus.learnTitle'), desc: t('landing.illus.learnDesc'), img: 'image/img-1.jpg' },
        { title: t('landing.illus.placeTitle'), desc: t('landing.illus.placeDesc'), img: 'image/img-2.png' },
        { title: t('landing.illus.interviewTitle'), desc: t('landing.illus.interviewDesc'), img: 'image/img-3.jpg' },
      ],
      audience: {
        heading: t('landing.audience.heading'),
        cards: [
          {
            tag: t('landing.audience.learnersTag'),
            title: t('landing.audience.learnersTitle'),
            desc: t('landing.audience.learnersDesc'),
            bullets: tArray('landing.audience.learnersBullets'),
            iconClass: 'fgi-b',
            tagClass: 'fgt-b',
          },
          {
            tag: t('landing.audience.orgsTag'),
            title: t('landing.audience.orgsTitle'),
            desc: t('landing.audience.orgsDesc'),
            bullets: tArray('landing.audience.orgsBullets'),
            iconClass: 'fgi-t',
            tagClass: 'fgt-t',
          },
          {
            tag: t('landing.audience.employersTag'),
            title: t('landing.audience.employersTitle'),
            desc: t('landing.audience.employersDesc'),
            bullets: tArray('landing.audience.employersBullets'),
            iconClass: 'fgi-i',
            tagClass: 'fgt-i',
          },
          {
            tag: t('landing.audience.featuresTag'),
            title: t('landing.audience.featuresTitle'),
            desc: t('landing.audience.featuresDesc'),
            bullets: tArray('landing.audience.featuresBullets'),
            iconClass: 'fgi-s',
            tagClass: 'fgt-s',
          },
        ],
      },
      howItWorks: {
        eyebrow: t('landing.howItWorks.eyebrow'),
        heading: t('landing.howItWorks.heading'),
        intro: t('landing.howItWorks.intro'),
        steps,
        phoneBrand: t('landing.howItWorks.phoneBrand'),
        phoneTag: t('landing.howItWorks.phoneTag'),
        profileLabel: t('landing.howItWorks.profileLabel'),
        profileHint: t('landing.howItWorks.profileHint'),
        skillLabel: t('landing.howItWorks.skillLabel'),
        skills: tArray('landing.howItWorks.skills'),
        partners: tArray('landing.howItWorks.partners'),
        partnerRole: t('landing.howItWorks.partnerRole'),
      },
      journey: {
        eyebrow: t('landing.journey.eyebrow'),
        steps: journeySteps,
      },
      platform: {
        eyebrow: t('landing.platform.eyebrow'),
        heading: t('landing.platform.heading'),
        headingAccent: t('landing.platform.headingAccent'),
        resumeTags: tArray('landing.platform.resumeTags'),
        dashboardTags: tArray('landing.platform.dashboardTags'),
        resumeEyebrow: t('landing.platform.resumeEyebrow'),
        resumeTitle: t('landing.platform.resumeTitle'),
        resumeDesc: t('landing.platform.resumeDesc'),
        interviewEyebrow: t('landing.platform.interviewEyebrow'),
        interviewTitle: t('landing.platform.interviewTitle'),
        interviewDesc: t('landing.platform.interviewDesc'),
        tracksEyebrow: t('landing.platform.tracksEyebrow'),
        tracksTitle: t('landing.platform.tracksTitle'),
        tracksDesc: t('landing.platform.tracksDesc'),
        credentialsEyebrow: t('landing.platform.credentialsEyebrow'),
        credentialsTitle: t('landing.platform.credentialsTitle'),
        credentialsDesc: t('landing.platform.credentialsDesc'),
        dashboardEyebrow: t('landing.platform.dashboardEyebrow'),
        dashboardTitle: t('landing.platform.dashboardTitle'),
        dashboardTitleAccent: t('landing.platform.dashboardTitleAccent'),
        dashboardDesc: t('landing.platform.dashboardDesc'),
        commEyebrow: t('landing.platform.commEyebrow'),
        commTitle: t('landing.platform.commTitle'),
        commDesc: t('landing.platform.commDesc'),
        jobsEyebrow: t('landing.platform.jobsEyebrow'),
        jobsTitle: t('landing.platform.jobsTitle'),
        jobsDesc: t('landing.platform.jobsDesc'),
        roadmapEyebrow: t('landing.platform.roadmapEyebrow'),
        roadmapTitle: t('landing.platform.roadmapTitle'),
        roadmapDesc: t('landing.platform.roadmapDesc'),
      },
      stats: [
        { value: t('landing.stats.stat1Value'), label: t('landing.stats.stat1Label') },
        { value: t('landing.stats.stat2Value'), label: t('landing.stats.stat2Label') },
        { value: t('landing.stats.stat3Value'), label: t('landing.stats.stat3Label') },
        { value: t('landing.stats.stat4Value'), label: t('landing.stats.stat4Label') },
      ],
      outcomes: {
        eyebrow: t('landing.outcomes.eyebrow'),
        heading: t('landing.outcomes.heading'),
        cards: outcomeCards,
        upliftLabel: t('landing.outcomes.upliftLabel'),
        before: t('landing.outcomes.before'),
        after: t('landing.outcomes.after'),
        growth: t('landing.outcomes.growth'),
        perMonth: t('landing.outcomes.perMonth'),
        incomeUplift: t('landing.outcomes.incomeUplift'),
      },
      testimonials,
      wordCloud: {
        heading: t('landing.wordCloud.heading'),
        sub: t('landing.wordCloud.sub'),
        words: tArray('landing.wordCloud.words'),
      },
      stories: {
        eyebrow: t('landing.stories.eyebrow'),
        heading: t('landing.stories.heading'),
        sub: t('landing.stories.sub'),
      },
      cta: {
        eyebrow: t('landing.cta.eyebrow'),
        heading: t('landing.cta.heading'),
        desc: t('landing.cta.desc'),
        primary: t('landing.cta.primary'),
        secondary: t('landing.cta.secondary'),
      },
      footer: {
        tagline: t('landing.footer.tagline'),
        tags: tArray('landing.footer.tags'),
        platform: t('landing.footer.platform'),
        platformLinks: tArray('landing.footer.platformLinks'),
        organisations: t('landing.footer.organisations'),
        orgLinks: tArray('landing.footer.orgLinks'),
        company: t('landing.footer.company'),
        companyLinks: tArray('landing.footer.companyLinks'),
        copyright: t('landing.footer.copyright'),
        social: tArray('landing.footer.social'),
      },
    }
  }, [t, tArray])
}
