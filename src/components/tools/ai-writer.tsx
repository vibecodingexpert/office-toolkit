"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Pen,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  FileText,
  List,
  AlignLeft,
  Mail,
  BookOpen,
  PenLine,
} from "lucide-react"

const TONES = ["Professional", "Casual", "Academic", "Creative", "Persuasive"] as const
const TONE_ICONS: Record<string, string> = {
  Professional: "💼",
  Casual: "😊",
  Academic: "📚",
  Creative: "🎨",
  Persuasive: "🎯",
}

const LENGTHS = ["Short", "Medium", "Long"] as const
const LENGTH_WORDS: Record<string, number> = { Short: 100, Medium: 250, Long: 500 }

const CONTENT_TYPES = [
  { value: "paragraph", label: "Paragraph", icon: AlignLeft },
  { value: "bullets", label: "Bullet Points", icon: List },
  { value: "essay", label: "Essay", icon: BookOpen },
  { value: "email", label: "Email", icon: Mail },
  { value: "story", label: "Story", icon: PenLine },
  { value: "article", label: "Article", icon: FileText },
] as const

const CONTENT_DATABASE: Record<string, Record<string, Record<string, string>>> = {
  email: {
    Professional: {
      Short: "Subject: Strategic Initiative Update\n\nDear Team,\n\nI am writing to provide a brief update on our strategic initiative. We have made significant progress and remain on track to meet our Q2 objectives. Key milestones have been achieved ahead of schedule.\n\nI look forward to our continued collaboration.\n\nBest regards,\n[Your Name]",
      Medium: "Subject: Quarterly Performance Review\n\nDear Stakeholders,\n\nI am pleased to present our quarterly performance review. Our analysis reveals a 35% improvement in operational efficiency, with projected cost savings of $2.8M annually. These results exceed our initial projections.\n\nKey achievements include:\n- Successful implementation of Phase 1\n- Team expansion and capability building\n- Enhanced stakeholder engagement\n\nI recommend we maintain our current trajectory and begin planning for Phase 2.\n\nBest regards,\n[Your Name]",
      Long: "Subject: Comprehensive Strategic Initiative Report\n\nDear Team,\n\nI am pleased to share this comprehensive report on our strategic initiative. The past quarter has been transformative, and I want to ensure everyone is aligned on our progress and future direction.\n\n**Executive Summary**\n\nOur initiative has delivered exceptional results across all key metrics. We have achieved a 35% improvement in operational efficiency, exceeding our target of 25%. Cost savings of $2.8M have been realized, with projections suggesting this will increase to $3.5M by year-end.\n\n**Detailed Analysis**\n\nThe success can be attributed to several factors:\n1. Cross-functional collaboration and alignment\n2. Data-driven decision making\n3. Agile implementation methodology\n4. Strong leadership commitment\n\n**Recommendations**\n\nMoving forward, I recommend:\n1. Proceeding with Phase 2 implementation\n2. Investing in additional training and development\n3. Establishing a continuous improvement framework\n\nI welcome your feedback and look forward to our continued success together.\n\nBest regards,\n[Your Name]",
    },
    Casual: {
      Short: "Subject: Quick Update!\n\nHey Team,\n\nJust wanted to share a quick update - things are going really well with our project! We're hitting all our targets and the team is doing amazing work.\n\nCan't wait to see what we accomplish next!\n\nCheers,\n[Your Name]",
      Medium: "Subject: Great Progress!\n\nHi everyone,\n\nI'm happy to report that things are looking awesome! Our project is right on track and we're seeing some really impressive results.\n\nHere's what's been happening:\n- We've hit all our Q2 milestones\n- The team is crushing it\n- Feedback has been super positive\n\nSo proud of what we're building together!\n\nBest,\n[Your Name]",
      Long: "Subject: The Journey So Far 🚀\n\nHey Team!\n\nWow, what a quarter it's been! I wanted to take a moment to share how incredible our progress has been and celebrate some wins together.\n\n**The Highlights**\n\nRemember when we started this journey? We had big dreams and ambitious goals. Well, guess what? We're making them happen! Our efficiency is up 35%, we've saved $2.8M, and most importantly, we've built something we can all be proud of.\n\n**The Secret Sauce**\n\nWhat made this work? Three things:\n1. You - the amazing people on this team\n2. Our willingness to try new things\n3. The trust we've built with each other\n\n**What's Next**\n\nWe're just getting started! Phase 2 is going to be even more exciting. I can't wait to see what we'll achieve next.\n\nLet's keep this momentum going!\n\nWith gratitude,\n[Your Name]",
    },
    Academic: {
      Short: "Subject: Preliminary Findings: Operational Analysis\n\nDear Colleagues,\n\nThis correspondence communicates preliminary findings from our operational analysis. The data indicate a statistically significant improvement of 35% in operational efficiency (p < 0.01).\n\nFurther analysis is warranted to validate these initial observations.\n\nSincerely,\n[Your Name]",
      Medium: "Subject: Interim Report: Organizational Transformation Initiative\n\nDear Research Team,\n\nThis interim report presents our findings from the first phase of the Organizational Transformation Initiative. Our methodology employed a mixed-methods approach combining quantitative metrics with qualitative assessment.\n\n**Preliminary Results**\n\nAnalysis reveals a 35% improvement in operational efficiency (Cohen's d = 0.84, indicating a large effect size). Financial modeling projects annual savings of $2.8M with 95% confidence interval [$2.1M, $3.5M].\n\n**Methodological Considerations**\n\nWhile these results are promising, we acknowledge limitations including sample size constraints and temporal factors that warrant continued investigation.\n\nI invite your comments and suggestions for the next phase of this investigation.\n\nRespectfully,\n[Your Name]",
      Long: "Subject: Comprehensive Analysis: Strategic Organizational Transformation\n\nDear Esteemed Colleagues,\n\nI am pleased to submit this comprehensive analysis of our strategic organizational transformation initiative. This report synthesizes findings from four months of rigorous investigation.\n\n**Abstract**\n\nThis study examines the impact of strategic organizational transformation on operational efficiency and financial performance. Employing a multi-dimensional analytical framework, we assessed changes across operational, financial, and organizational dimensions.\n\n**Methodology**\n\nOur analytical approach encompassed:\n1. Quantitative efficiency analysis using time-motion studies\n2. Financial modeling employing discounted cash flow analysis\n3. Risk assessment utilizing Monte Carlo simulation\n\n**Results**\n\nOperational efficiency improved by 35% (p < 0.01). Net present value is calculated at $4.2M with an internal rate of return of 34%.\n\n**Discussion**\n\nThese findings contribute to the growing body of evidence supporting strategic transformation initiatives. The implications for organizational theory and practice are significant.\n\n**Conclusion**\n\nWe recommend continued implementation with rigorous ongoing evaluation.\n\nRespectfully submitted,\n[Your Name]",
    },
    Creative: {
      Short: "Subject: Our Story Unfolds ✨\n\nDear Dreamers and Doers,\n\nToday, we didn't just check boxes - we painted masterpieces. Our efficiency didn't just improve; it soared on wings of innovation. The numbers tell a story of 35% more magic, $2.8M in found treasure.\n\nThis is just the beginning of our beautiful journey.\n\nWith wonder,\n[Your Name]",
      Medium: "Subject: The Canvas of Our Achievement 🎨\n\nDear Fellow Creators,\n\nWhat if I told you that spreadsheets could sing? That metrics could dance? Because that's exactly what's happening in our world right now.\n\n**The Picture We've Painted**\n\nOur canvas is alive with color:\n- Efficiency blooms at 35% brighter\n- Savings sparkle at $2.8M\n- Our team shines with innovation\n\n**The Artist's Touch**\n\nEvery brushstroke matters. Every team member is an artist, and together we're creating something magnificent. The gallery of our achievements grows more beautiful each day.\n\n**The Next Masterpiece**\n\nPhase 2 awaits - a blank canvas brimming with possibility. What will we create together?\n\nKeep painting,\n[Your Name]",
      Long: "Subject: The Symphony of Our Success 🎵\n\nDear Maestros and Virtuosos,\n\nClose your eyes and listen. Do you hear it? That's the symphony of our collective achievement - a masterpiece composed of dedication, innovation, and unwavering commitment to excellence.\n\n**The Overture**\n\nOur journey began with a single note - a vision that seemed almost too ambitious. Yet here we stand, having composed something truly remarkable.\n\n**The Movements**\n\n**First Movement (Allegro con brio)**\nWe burst onto the scene with energy and purpose. Efficiency accelerated by 35% - not just an improvement, but a transformation.\n\n**Second Movement (Andante sostenuto)**\nIn the quiet moments of focused work, we saved $2.8M. Each dollar a carefully crafted note in our financial symphony.\n\n**Third Movement (Scherzo)**\nWe played with ideas, experimented with approaches, and found joy in the creative process.\n\n**Finale (Maestoso)**\nThe grand culmination - a 185% ROI that resonates like a triumphant chord.\n\n**The Encore**\n\nPhase 2 beckons. The orchestra is tuned, the score is ready. Let's create an encore that will echo through the ages.\n\nWith harmony and passion,\n[Your Name]",
    },
    Persuasive: {
      Short: "Subject: The Case for Immediate Action\n\nDear Decision Makers,\n\nThe data is clear: we have a 35% opportunity for improvement and $2.8M in potential savings. Every day of delay costs us money and competitive advantage.\n\nThe question isn't whether we can afford to act - it's whether we can afford not to.\n\nI urge you to approve the next phase.\n\nDetermined,\n[Your Name]",
      Medium: "Subject: Why We Must Act Now: An Urgent Proposal\n\nDear Stakeholders,\n\nI'm writing to you today not with a request, but with an imperative. The evidence before us is undeniable, and the cost of inaction far exceeds the investment required.\n\n**The Opportunity**\n\n- 185% ROI over three years\n- 35% operational improvement\n- $2.8M annual savings\n\n**The Risk of Delay**\n\nWhile we deliberate, our competitors are moving. Market conditions are favorable now but won't last forever. The window of opportunity is closing.\n\n**The Cost of Inaction**\n\nEvery quarter we wait costs approximately $700K in foregone savings. More importantly, it costs us market position and competitive relevance.\n\nI urge you to approve this initiative today. The evidence is compelling, the team is ready, and the time is now.\n\nRespectfully,\n[Your Name]",
      Long: "Subject: An Urgent Case for Strategic Investment\n\nDear Leadership Team,\n\nI'm writing to make the most important business case of our fiscal year. What I'm about to share isn't merely a recommendation - it's a strategic imperative that will define our trajectory for years to come.\n\n**The Evidence**\n\nOur analysis is rigorous, conservative, and conclusive:\n\n**Financial Returns**: 185% ROI over three years. Net present value of $4.2M. Payback period of just 14 months.\n\n**Operational Impact**: 35% improvement in efficiency. $2.8M in annual savings. These aren't projections - they're conservative estimates.\n\n**Competitive Position**: Three major competitors have announced similar initiatives. Early movers will capture disproportionate advantages.\n\n**The Alternative**\n\nDoing nothing has a cost that doesn't appear on any balance sheet: missed opportunity, competitive disadvantage, and projects delayed until they become irrelevant.\n\n**The Ask**\n\nI respectfully request:\n1. Authorization of the Q2 pilot program\n2. Initial funding of $500K\n3. Establishment of a steering committee\n4. Immediate commencement of stakeholder communications\n\n**The Promise**\n\nI guarantee rigorous oversight, transparent reporting, and a commitment to deliver the results our analysis projects.\n\nThe time to act is now. I await your decision.\n\nWith urgency and respect,\n[Your Name]",
    },
  },
  story: {
    Creative: {
      Short: "**The Last Library**\n\nIn a world where books were forgotten, one library remained. Its shelves held not just stories, but memories. The old librarian, Elara, watched over them like a guardian of dreams. Every evening, she would read aloud to the empty chairs, keeping the words alive.\n\nOne day, a child wandered in. \"What is this place?\" she asked.\n\nElara smiled. \"This is where worlds begin.\"\n\nThe child picked up a book, and in that moment, the library breathed again.",
      Medium: "**The Clockmaker's Secret**\n\nIn the heart of Prague, an old clockmaker named Viktor crafted timepieces that did more than tell time - they captured moments. Each clock held a memory, frozen in gears and springs.\n\nHis most famous creation stood in the town square. At noon, it didn't just chime; it played the laughter of children from a century past, the whispers of lovers, the cheers of celebrations long since faded into history.\n\nWhen asked how he did it, Viktor would tap his nose and say, \"Time isn't linear. It's a river that flows in all directions. I just built a boat.\"\n\nOne winter, a young journalist came to interview him. \"What will happen when you're gone?\" she asked.\n\nViktor looked at his workshop full of ticking clocks. \"I'm not going anywhere,\" he said. \"I'm already in every moment I've ever captured.\"\n\nThe next morning, Viktor was gone. But his clocks continue to chime, and on quiet evenings, if you listen closely, you can hear his laughter in the ticking.",
      Long: "**The Garden of Forgotten Things**\n\n**Part I: The Discovery**\n\nMaya never expected to find a garden growing behind the old train station. But there it was, hidden behind a crumbling wall, bursting with flowers she'd never seen before. Each bloom seemed to glow with an inner light, casting rainbow shadows on the mossy ground.\n\nIn the center stood an old woman with silver hair and eyes the color of twilight. \"Welcome,\" she said, \"to the Garden of Forgotten Things.\"\n\n\"I don't understand,\" Maya said.\n\nThe woman plucked a flower that looked like a tiny blue bell. \"This is your grandmother's lullaby. She forgot it when she grew up, but it's been growing here ever since.\"\n\n**Part II: The Flowers**\n\nEach flower in the garden was a forgotten memory, a lost dream, a discarded hope. There were roses of first loves, daisies of childhood adventures, and orchids of ambitions abandoned too soon.\n\n\"Why do they come here?\" Maya asked.\n\n\"Because forgetting is not the same as losing,\" the woman said. \"Everything you've ever loved, everything you've ever dreamed - it doesn't disappear. It just takes root here, waiting to be remembered again.\"\n\nMaya walked through the garden, recognizing flowers from her own life. There was the yellow tulip of her first day at school, the purple aster of her first heartbreak, the golden lotus of a dream she'd given up on.\n\n**Part III: The Choice**\n\n\"You can take one flower with you,\" the woman said. \"But choose wisely. Reclaiming a memory means living with it fully - the joy and the pain.\"\n\nMaya looked at the garden stretching to the horizon, endless and beautiful. She thought about all the things people forget, all the dreams they abandon, all the loves they leave behind.\n\n\"I'll take them all,\" Maya said.\n\nThe old woman laughed, a sound like wind chimes. \"You can't. That's not how it works.\"\n\n\"Then I'll come back,\" Maya said. \"Every day, until I remember everything.\"\n\n**Epilogue**\n\nMaya kept her promise. She visited the garden every day, taking one flower at a time, remembering one thing at a time. Years passed. The old woman grew younger as the garden grew smaller.\n\nOn the last day, when only one flower remained, the woman was young again, her silver hair turned gold.\n\n\"You've remembered everything,\" she said.\n\n\"Not everything,\" Maya said, holding the last flower - a small white blossom she didn't recognize. \"What's this one?\"\n\nThe woman smiled. \"That's the first dream you ever had. The one you had before you learned that dreams could be forgotten.\"\n\nMaya took the flower. As it touched her skin, she remembered everything she'd ever been, everything she'd ever hoped to be.\n\nAnd the garden disappeared, because it was no longer needed. Everything had been remembered.\n\n**The End**",
    },
  },
}

const FALLBACK_CONTENT: Record<string, Record<string, Record<string, string>>> = {
  Professional: {
    Short: {
      paragraph: "Based on our analysis, the proposed initiative demonstrates significant potential for organizational growth. Key metrics indicate a 35% improvement in operational efficiency, with projected cost savings of $2.8M annually. We recommend proceeding with Phase 1 implementation by Q2.",
      bullets: "- 35% improvement in operational efficiency\n- $2.8M annual cost savings projected\n- Q2 Phase 1 implementation recommended\n- Risk assessment: Low to moderate\n- Stakeholder alignment confirmed",
      essay: "**Executive Summary**\n\nThe proposed initiative represents a strategic opportunity to enhance organizational performance. Our comprehensive analysis reveals multiple avenues for value creation.\n\n**Key Findings**\n\nOperational efficiency improvements of 35% are achievable through process optimization and technology integration. Financial modeling projects annual cost savings of $2.8M.\n\n**Recommendations**\n\n1. Proceed with Phase 1 implementation in Q2\n2. Establish cross-functional steering committee\n3. Implement quarterly performance reviews\n\n**Conclusion**\n\nThe initiative aligns with our strategic objectives and warrants immediate attention.",
      article: "# Strategic Initiative Analysis\n\n## Introduction\nThe landscape of modern business demands continuous improvement and innovation.\n\n## Key Findings\nOur analysis reveals significant opportunities for organizational growth through targeted operational improvements.\n\n## Recommendations\nWe recommend a phased approach to implementation, beginning with a pilot program.\n\n## Conclusion\nThe evidence strongly supports proceeding with this initiative.",
    },
    Medium: {
      paragraph: "A comprehensive evaluation of the strategic initiative reveals substantial opportunities for value creation across multiple dimensions. Our analysis encompasses operational metrics, financial projections, and stakeholder impact. The proposed implementation framework leverages industry best practices. Preliminary projections indicate a projected ROI of 185% over a three-year horizon. We recommend a phased approach beginning with a pilot program in Q2.",
      bullets: "- Projected ROI of 185% over three-year horizon\n- Pilot program recommended for Q2 launch\n- Full-scale deployment targeted for Q3\n- Risk mitigation through phased approach\n- Stakeholder engagement plan developed\n- Success metrics defined across 12 KPIs",
      essay: "**Strategic Initiative Analysis**\n\n**1. Introduction**\n\nThis document presents a comprehensive evaluation of the strategic initiative under consideration.\n\n**2. Operational Assessment**\n\nOur evaluation indicates significant opportunities for process optimization in three areas: data management, cross-departmental communication, and resource allocation.\n\n**3. Financial Projections**\n\nThe projected return on investment is 185% over three years.\n\n**4. Implementation Strategy**\n\nWe recommend a phased approach with pilot in Q2, full-scale in Q3, and optimization in Q4.\n\n**5. Conclusion**\n\nThe initiative demonstrates strong strategic alignment and financial viability.",
      article: "# Strategic Initiative Analysis\n\n## Executive Summary\nThis article presents a comprehensive evaluation of strategic opportunities.\n\n## Background\nThe current business environment presents both challenges and opportunities for growth.\n\n## Analysis\nOur multi-dimensional analysis reveals significant potential for value creation.\n\n## Implementation\nA phased approach minimizes risk while maximizing returns.\n\n## Conclusion\nStrategic action is warranted to capture the identified opportunities.",
    },
    Long: {
      paragraph: "A comprehensive evaluation of the strategic initiative reveals substantial opportunities for value creation across multiple dimensions of our organization. Our analysis encompasses a thorough examination of operational metrics, detailed financial projections encompassing multiple scenarios, comprehensive risk assessment with mitigation strategies, and extensive stakeholder impact analysis. The proposed implementation framework leverages industry best practices while accommodating our unique organizational context. Preliminary projections indicate a projected ROI of 185% over a three-year horizon, with primary benefits concentrated in operational efficiency gains estimated at 35%, cost reduction opportunities totaling $2.8M annually, and revenue enhancement potential through improved service delivery. We recommend a carefully structured phased approach beginning with a pilot program in Q2, followed by full-scale deployment in Q3, and optimization in Q4.",
      bullets: "- Comprehensive evaluation across operational, financial, risk, and stakeholder dimensions\n- Projected ROI of 185% over three-year horizon with NPV of $4.2M\n- Operational efficiency improvements estimated at 35%\n- Annual cost savings projected at $2.8M\n- Phased implementation: Pilot (Q2), Full-scale (Q3), Optimization (Q4)\n- 12 KPIs defined across financial, operational, and customer dimensions",
      essay: "# Strategic Initiative Analysis and Implementation Framework\n\n## Executive Summary\n\nThis comprehensive evaluation examines the strategic initiative's potential for organizational transformation.\n\n## 1. Operational Analysis\n\n### Current State Assessment\nThree primary areas of inefficiency have been identified.\n\n### Proposed Improvements\n- Automated data management systems\n- Streamlined cross-departmental communication\n- Optimized resource allocation frameworks\n\n## 2. Financial Analysis\n\n### Projections\n- ROI: 185% over three years\n- NPV: $4.2M\n- IRR: 34%\n- Payback Period: 14 months\n\n## 3. Implementation Plan\n\n### Phase 1: Pilot (Q2)\n### Phase 2: Full-scale (Q3)\n### Phase 3: Optimization (Q4)\n\n## 4. Conclusion\nThe initiative presents a compelling opportunity for value creation.",
      article: "# Strategic Initiative Analysis: A Comprehensive Guide\n\n## Abstract\nThis article provides a comprehensive analysis of strategic organizational transformation.\n\n## The Current Landscape\nModern organizations face unprecedented challenges and opportunities in an increasingly competitive environment.\n\n## Methodology\nOur analysis employs a multi-dimensional framework encompassing operational, financial, and strategic factors.\n\n## Key Findings\nThe data reveal significant potential for value creation across multiple dimensions.\n\n## Strategic Recommendations\nWe outline a clear path forward with specific, actionable recommendations.\n\n## Conclusion\nThe evidence supports proceeding with the proposed strategic initiative.",
    },
  },
  Casual: {
    Short: {
      paragraph: "Hey! So here's the deal - this is actually a really solid opportunity for us. We're looking at some pretty impressive numbers: about 35% better efficiency and saving around $2.8M every year. The best part? We can start small with a pilot in Q2 and figure things out as we go. What do you think?",
      bullets: "- 35% boost in efficiency (pretty sweet!)\n- ~$2.8M in yearly savings\n- Start small with a Q2 pilot\n- Low risk, high reward\n- Team's already on board",
      essay: "**So Here's the Thing**\n\nI've been digging into this project and honestly, it looks really promising.\n\n**The Good Stuff**\n\nWe're looking at some serious improvements - 35% better efficiency and $2.8M in savings.\n\n**How We'd Do It**\n\nStart small with a pilot in Q2, learn what works, then go all in.\n\n**Bottom Line**\n\nGreat ROI, manageable risk, and the team's excited. Let's do this!",
      article: "# The Cool Thing About [Topic]\n\nHey everyone! Let me share something exciting with you.\n\n## Why It Matters\nThis is actually way more important than most people think.\n\n## The Simple Version\nHere's what you need to know without all the boring stuff.\n\n## Wrapping Up\nHope this helps! Let me know what you think.",
    },
    Medium: {
      paragraph: "Alright, so I've been looking at this opportunity and I'm honestly pretty excited about it. The numbers are looking really good - we're talking about a 185% ROI over three years, which is honestly amazing. The key metrics are all pointing in the right direction: 35% improvement in how efficiently we operate, saving about $2.8M every year. My suggestion? Let's start with a pilot in Q2, then roll it out fully in Q3.",
      bullets: "- 185% ROI over 3 years - let's go!\n- 35% efficiency improvement across the board\n- $2.8M in annual savings (cha-ching!)\n- Pilot in Q2, full rollout in Q3\n- Low risk approach with big upside\n- 12 success metrics to track progress",
      essay: "**Let's Talk About This Awesome Opportunity**\n\n**What We're Looking At**\n\nSo I've done the analysis and honestly? This is looking really good.\n\n**The Numbers**\n- 185% ROI over three years\n- 35% better efficiency\n- $2.8M in savings every year\n\n**The Plan**\n1. Q2: Try it out with a pilot\n2. Q3: Roll it out everywhere\n3. Q4: Make it even better\n\n**Why This Works**\nLow risk, huge upside, excited team.",
      article: "# [Topic]: What You Need to Know\n\nHey there! Let's chat about something interesting.\n\n## What's the Big Deal?\nThis is actually way cooler than it sounds.\n\n## Breaking It Down\nLet me explain why this matters in plain English.\n\n## Quick Tips\nHere are some things to keep in mind.\n\n## That's a Wrap!\nHope you found this helpful!",
    },
    Long: {
      paragraph: "Okay so I've been spending a lot of time thinking about this and running the numbers, and I've got to say - I'm really pumped about what I'm seeing. This isn't just another project, this is something that could genuinely transform how we work. The financials are looking incredible - we're projecting a 185% ROI over three years, which means every dollar we invest comes back almost three times over. We're looking at 35% better operational efficiency. And the savings? $2.8M every year that we can reinvest into even cooler projects.",
      bullets: "- 185% ROI - every dollar returns almost threefold!\n- 35% efficiency boost means more time for meaningful work\n- $2.8M annual savings to reinvest in growth\n- Smart phased approach: Pilot in Q2, full rollout in Q3, optimize in Q4\n- Super low risk - start small, learn fast, scale smart\n- 12 different success metrics to track how we're doing",
      essay: "**The Big Opportunity: Why This Project Rocks**\n\n**Starting Thoughts**\n\nHey team! I've been deep-diving into this for a while and I honestly can't contain my excitement.\n\n**Why This Matters**\n\nWe've all felt the pain points - inefficient processes, wasted time, missed opportunities. This project fixes all of that.\n\n**The Numbers**\n- 185% ROI over 3 years\n- 35% efficiency improvement\n- $2.8M annual savings\n- 14-month payback period\n\n**How We Make It Happen**\nPhase 1 (Q2): The Pilot\nPhase 2 (Q3): Scale It Up\nPhase 3 (Q4): Make It Perfect\n\n**The Bottom Line**\nGreat returns, minimal risk, excited team. Let's make it happen!",
      article: "# Everything You Need to Know About [Topic]\n\n## So What's This All About?\n\nLet's dive into something that's been on my mind lately.\n\n## The Backstory\n\nIt all started when I realized there had to be a better way.\n\n## The Good Stuff\n\nHere are the key things you should know:\n\n## What I've Learned\n\nAfter spending time with this, here's what surprised me most.\n\n## Your Turn\n\nNow it's up to you! Give it a try and see what happens.",
    },
  },
  Academic: {
    Short: {
      paragraph: "The proposed initiative demonstrates statistically significant potential for organizational enhancement. Quantitative analysis reveals a 35% improvement in operational efficiency (p < 0.01) with projected annual cost savings of $2.8M. The recommended implementation framework adopts a phased methodology beginning with a pilot program in Q2.",
      bullets: "- 35% operational efficiency improvement (p < 0.01)\n- $2.8M projected annual cost savings\n- Q2 pilot program recommended\n- Phased implementation methodology\n- Empirical validation framework established",
      essay: "**Abstract**\n\nThis analysis examines the strategic initiative's potential for organizational enhancement through a multi-dimensional evaluation framework.\n\n**Findings**\n\nThe analysis reveals a 35% improvement in operational efficiency (p < 0.01) with projected annual cost savings of $2.8M.\n\n**Recommendations**\n1. Implement phased deployment beginning Q2\n2. Establish empirical validation metrics\n3. Conduct quarterly performance assessments\n\n**Conclusion**\nThe initiative demonstrates strong empirical support for proceeding.",
      article: "# Analysis of [Topic]: A Scholarly Perspective\n\n## Abstract\nThis article presents a rigorous examination of the subject matter.\n\n## Introduction\nThe contemporary landscape demands evidence-based approaches.\n\n## Methodology\nOur analytical framework employs established research methods.\n\n## Results\nThe data reveal significant patterns worthy of discussion.\n\n## Conclusion\nImplications for theory and practice are discussed.",
    },
    Medium: {
      paragraph: "This investigation employs a comprehensive analytical framework to evaluate the proposed strategic initiative's potential for organizational value creation. The methodology encompasses operational efficiency analysis, financial modeling with sensitivity analysis, risk assessment utilizing Monte Carlo simulation, and stakeholder impact evaluation. Preliminary results indicate a statistically significant improvement in operational efficiency of 35% (p < 0.01, Cohen's d = 0.84), with projected annual cost savings of $2.8M (95% CI: $2.1M - $3.5M).",
      bullets: "- 35% operational efficiency improvement (p < 0.01, d = 0.84)\n- $2.8M annual cost savings (95% CI: $2.1M - $3.5M)\n- NPV: $4.2M with IRR of 34%\n- Monte Carlo risk assessment completed\n- Phased implementation: Pilot Q2, Full-scale Q3\n- 12 KPIs for quantitative assessment",
      essay: "**A Comprehensive Analysis of Strategic Initiative Implementation**\n\n**Abstract**\n\nThis paper presents a rigorous evaluation of a proposed strategic initiative.\n\n**1. Introduction**\n\nThe contemporary organizational landscape demands evidence-based decision-making frameworks.\n\n**2. Methodology**\n\nQuantitative analysis and qualitative assessment were employed.\n\n**3. Results**\n\nA 35% improvement was observed (p < 0.01, Cohen's d = 0.84).\n\n**4. Discussion**\n\nThe results provide compelling evidence for proceeding with implementation.\n\n**5. Conclusion**\n\nThis analysis supports the strategic initiative's implementation with a phased approach.",
      article: "# A Scholarly Examination of [Topic]\n\n## Abstract\nThis article contributes to the academic discourse surrounding the subject.\n\n## Literature Review\nPrevious research has established foundational understanding in this domain.\n\n## Theoretical Framework\nOur analysis is grounded in established theoretical perspectives.\n\n## Analysis\nWe present a rigorous examination of the available evidence.\n\n## Discussion\nThe implications for future research and practice are significant.",
    },
    Long: {
      paragraph: "This investigation employs a comprehensive multi-dimensional analytical framework to rigorously evaluate the proposed strategic initiative's potential for organizational value creation and transformation. The methodology encompasses four primary analytical dimensions: (1) operational efficiency analysis utilizing time-motion studies and process optimization modeling; (2) financial modeling incorporating discounted cash flow analysis, sensitivity analysis across multiple scenarios, and Monte Carlo simulation for risk quantification; (3) organizational impact assessment; and (4) risk assessment employing a comprehensive risk identification and mitigation framework.",
      bullets: "- 35% operational efficiency improvement (p < 0.01, Cohen's d = 0.84)\n- $2.8M annual cost savings (95% CI: $2.1M - $3.5M)\n- NPV: $4.2M (8% discount rate), IRR: 34%\n- Monte Carlo simulation: 89% probability of positive NPV\n- Four-dimensional analytical framework employed\n- Phased implementation: Pilot (Q2), Full-scale (Q3), Optimization (Q4)\n- Comprehensive risk assessment with 12 identified risk factors\n- 12 KPIs across financial, operational, and strategic dimensions",
      essay: "# A Comprehensive Analysis of Strategic Initiative Implementation\n\n## Abstract\n\nThis paper presents a rigorous, multi-dimensional evaluation of a proposed strategic initiative.\n\n## 1. Introduction\n\nThe contemporary organizational landscape demands rigorous, evidence-based decision-making frameworks.\n\n## 2. Methodology\n\n### 2.1 Operational Analysis\n### 2.2 Financial Modeling\n### 2.3 Risk Assessment\n\n## 3. Results\n\nStatistically significant improvement of 35% (p < 0.01, d = 0.84)\n\n## 4. Discussion\n\nThe results provide compelling evidence supporting implementation.\n\n## 5. Conclusion\n\nThis comprehensive analysis supports the strategic initiative's implementation.",
      article: "# An In-Depth Scholarly Analysis of [Topic]\n\n## Abstract\nThis comprehensive article examines the subject through multiple theoretical lenses.\n\n## Introduction and Background\nThe topic has attracted significant scholarly attention in recent years.\n\n## Theoretical Foundations\nWe draw upon established theoretical frameworks to structure our analysis.\n\n## Critical Analysis\nThe available evidence is examined through a rigorous analytical lens.\n\n## Synthesis and Implications\nWe synthesize findings and discuss implications for research and practice.\n\n## Conclusion\nDirections for future inquiry are proposed.",
    },
  },
  Creative: {
    Short: {
      paragraph: "Imagine a world where your workflows flow like a perfectly choreographed dance. Every step seamless, every move intentional, every outcome extraordinary. That's not a distant dream—it's the reality we're building. With 35% more efficiency and $2.8M in annual savings, we're not just optimizing; we're reimagining what's possible.",
      bullets: "- ✨ 35% efficiency magic\n- 💰 $2.8M savings symphony\n- 🚀 Q2 pilot launchpad\n- 🌟 Full-scale by Q3\n- 💡 Innovation at every step",
      essay: "**The Canvas of Opportunity**\n\nEvery great creation begins with a vision. Ours is a workplace transformed.\n\n**The Palette of Possibilities**\n\nWe've mixed the colors of innovation and painted a picture of what's possible.\n\n**The Masterpiece**\n\nThis isn't just a project. It's a reimagining of how we work, create, and thrive.",
      article: "# The Art of [Topic]\n\n## A Beautiful Beginning\n\nEvery great story starts with a single spark of inspiration.\n\n## The Creative Process\n\nLet me walk you through the creative journey.\n\n## Inspiration Gallery\n\nHere are some examples that showcase the possibilities.\n\n## Your Creative Journey\n\nNow it's your turn to create something amazing.",
    },
    Medium: {
      paragraph: "Picture this: a workplace where ideas flow as freely as a mountain stream, where efficiency isn't a buzzword but a living, breathing reality. We've run the numbers, dreamed the dreams, and crafted a vision that's as practical as it is inspiring. A 185% ROI isn't just a statistic—it's a story of transformation waiting to be written. The 35% efficiency gain isn't just an improvement; it's a renaissance of productivity.",
      bullets: "- 🌈 185% ROI - returns as colorful as our vision\n- ⚡ 35% efficiency - lightning in a bottle\n- 💎 $2.8M savings - treasure waiting to be claimed\n- 🎯 Q2 pilot - where the adventure begins\n- 🚀 Q3 rollout - scaling the peaks of possibility\n- 🎨 12 metrics - painting our path to success",
      essay: "**The Art of What's Possible**\n\n**Chapter 1: The Vision**\n\nIn the canvas of corporate possibility, few opportunities shine as brightly as this one.\n\n**Chapter 2: The Numbers (They Tell a Story)**\n\n185% ROI - not just a percentage, but a promise.\n35% efficiency - not just improvement, but evolution.\n\n**Chapter 3: The Journey**\n\nEvery masterpiece has its process.\n1. Q2: The first brushstroke\n2. Q3: The painting takes shape\n3. Q4: The final touches\n\n**The Final Frame**\n\nThis isn't just a project. It's our collective masterpiece.",
      article: "# [Topic]: A Creative Exploration\n\n## The Spark\n\nIt all begins with a moment of inspiration.\n\n## The Journey\n\nFollow along as we explore the creative landscape.\n\n## Discoveries\n\nAlong the way, we uncover surprising insights.\n\n## The Vision\n\nHere's what the future could look like.\n\n## Join the Adventure\n\nThe journey is just beginning, and you're invited.",
    },
    Long: {
      paragraph: "Close your eyes and imagine. Not the workplace you know—the one you've always dreamed of. Where efficiency isn't a metric you chase but a rhythm you move to. Where every process flows like a perfectly composed symphony, each note hitting at exactly the right moment. Where the friction of today becomes the flow of tomorrow. This isn't fantasy—it's the future we're building. We've analyzed, calculated, and dreamed, and the numbers tell a story more beautiful than any algorithm could predict. A 185% ROI isn't just growth—it's metamorphosis.",
      bullets: "- 🎵 185% ROI - a symphony of returns\n- ⚡ 35% efficiency - the thunder of transformation\n- 💰 $2.8M savings - treasure chest of opportunity\n- 🚀 Q2 pilot - the launchpad of innovation\n- 🌟 Q3 full-scale - when dreams take flight\n- ✨ Q4 optimization - polishing the masterpiece\n- 🎯 12 metrics - stars guiding our journey\n- 💡 14-month payback - returns that rhyme",
      essay: "# The Renaissance of Work: A Story of Transformation\n\n## Prologue: Where We Stand\n\nEvery great transformation begins with a single moment of clarity.\n\n## Act I: The Vision\n\n**Scene 1: The Possibility**\n\nImagine a workplace where every process flows like a river.\n\n**Scene 2: The Numbers**\n\nOur analysis reveals a future written in bold strokes.\n\n## Act II: The Journey\n\n**Scene 1: The First Step (Q2)**\n**Scene 2: The Expansion (Q3)**\n**Scene 3: The Mastery (Q4)**\n\n## Act III: The Transformation\n\nThis isn't a project with an end date. It's a new way of working.\n\n## Epilogue: Your Role\n\nEvery masterpiece needs its artists. Welcome to the studio.",
      article: "# [Topic]: A Creative Manifesto\n\n## Prologue\n\nBefore we begin, let me tell you a story.\n\n## The Awakening\n\nThere comes a moment when you realize things could be different.\n\n## The Path\n\nThe road ahead is illuminated by creativity and innovation.\n\n## The Transformation\n\nWatch as ordinary becomes extraordinary.\n\n## The Future\n\nWhat lies ahead is limited only by our imagination.\n\n## Epilogue\n\nThe story continues, and you're writing the next chapter.",
    },
  },
  Persuasive: {
    Short: {
      paragraph: "Don't let this opportunity pass you by. We're looking at a 35% efficiency boost and $2.8M in annual savings—numbers that speak for themselves. The risk? Minimal. The reward? Transformational. With a Q2 pilot, we can start seeing results in just months. The question isn't whether we can afford to do this—it's whether we can afford not to.",
      bullets: "- 35% efficiency gain - can you ignore this?\n- $2.8M annual savings - real money, real impact\n- Minimal risk with phased approach\n- Q2 pilot means fast results\n- The cost of inaction is higher",
      essay: "**The Case for Action**\n\n**Why We Can't Wait**\n\nEvery day we delay, we're leaving money on the table.\n\n**The Numbers Don't Lie**\n\n- 35% efficiency improvement\n- $2.8M annual savings\n- 185% ROI over three years\n\n**The Risk of Inaction**\n\nCompetitors are moving. The cost of doing nothing isn't zero.\n\n**Our Recommendation**\n\nApprove the Q2 pilot. The evidence is compelling.",
      article: "# Why [Topic] Matters Now More Than Ever\n\n## The Wake-Up Call\n\nThe status quo isn't working, and the evidence is everywhere.\n\n## Why This Matters\n\nThis isn't just important - it's essential for success.\n\n## The Cost of Waiting\n\nEvery day of delay comes with a price.\n\n## The Solution\n\nHere's what we need to do, and why we need to do it now.\n\n## Call to Action\n\nThe time for debate is over. The time for action is now.",
    },
    Medium: {
      paragraph: "The evidence is overwhelming and the case is clear: this initiative represents our best opportunity for transformative growth. Let me be direct about what's at stake. We're projecting a 185% ROI over three years. The 35% efficiency improvement isn't aspirational; it's a conservative estimate based on rigorous analysis. And the $2.8M in annual savings? That's real money that could fund our next wave of innovation. The alternative is doing nothing. In today's competitive landscape, standing still means falling behind.",
      bullets: "- 185% ROI - double your investment back\n- 35% efficiency - conservative, achievable target\n- $2.8M savings - fuel for future innovation\n- Q2 pilot - fast start, minimal risk\n- Competitors are already moving\n- The cost of inaction exceeds the investment\n- Risk profile is exceptionally favorable",
      essay: "**Why This Initiative Demands Your Approval**\n\n**Executive Summary**\n\nThis document presents an urgent case for proceeding with the strategic initiative.\n\n**The Financial Imperative**\n- ROI: 185% over three years\n- Annual Savings: $2.8M\n- Payback Period: 14 months\n\n**The Competitive Imperative**\n\nOur competitors are investing in similar capabilities.\n\n**The Risk Argument**\n\nThe phased approach minimizes exposure while maximizing returns.\n\n**Call to Action**\n\nApprove the Q2 pilot. The evidence is compelling.",
      article: "# The Imperative for [Topic]: Why We Must Act\n\n## The Challenge\n\nWe face a challenge that demands immediate attention.\n\n## The Opportunity\n\nEmbedded within this challenge is an extraordinary opportunity.\n\n## The Evidence\n\nThe data is clear, the case is compelling, the time is now.\n\n## The Path Forward\n\nHere's exactly what we need to do.\n\n## The Call\n\nThe future belongs to those who act decisively.",
    },
    Long: {
      paragraph: "I'm going to be direct with you because this matters too much to sugarcoat. We are at a crossroads, and the path we choose today will determine our trajectory for years to come. The analysis we've conducted is rigorous, thorough, and conservative in its assumptions. And it tells a story that's impossible to ignore: this initiative delivers a projected 185% ROI over three years, with a 35% improvement in operational efficiency and $2.8M in annual cost savings. Our competitors are not waiting. The market is not waiting. And we shouldn't either.",
      bullets: "- 185% ROI - exceptional returns by any measure\n- 35% efficiency improvement - conservative and achievable\n- $2.8M annual savings - real, recurring, reinvestable\n- Q2 pilot - value capture starts in months, not years\n- Risk minimized through phased approach\n- Competitors are investing now\n- Cost of inaction: incalculable but real\n- Multiple scenario analysis confirms viability\n- Payback in just 14 months\n- 89% probability of positive returns (Monte Carlo)",
      essay: "# The Imperative for Action: Why We Must Proceed Now\n\n## Executive Summary\n\nThis document presents an urgent, evidence-based case for immediate approval.\n\n## 1. The Financial Case\n\n### 1.1 Return on Investment\nProjected 185% ROI over three years.\n\n### 1.2 Cost-Benefit Analysis\nNet benefit of $2.5M annually by Year 3.\n\n## 2. The Competitive Case\n\n### 2.1 Market Context\nThree major competitors have announced similar initiatives.\n\n### 2.2 The Cost of Delay\nEvery quarter of delay costs approximately $700K.\n\n## 3. The Risk Case\n\nOverall risk is Low to Moderate with comprehensive mitigation.\n\n## 4. Call to Action\n\nThe evidence is clear. The team is ready. The time is now.",
      article: "# [Topic]: An Urgent Call to Action\n\n## Executive Summary\n\nThis is not merely important. This is critical.\n\n## The Current Crisis\n\nWe face a convergence of challenges that demand immediate response.\n\n## The Stakes\n\nWhat's at stake is nothing less than our future success.\n\n## The Evidence\n\nThe case is built on irrefutable data and analysis.\n\n## The Solution\n\nWe have a clear, actionable path forward.\n\n## Why Now\n\nTiming is everything, and the moment is now.\n\n## Your Decision\n\nThe future is in your hands. Choose wisely.",
    },
  },
}

function getContent(tone: string, length: string, contentType: string, topic: string): string {
  const typeContent = CONTENT_DATABASE[contentType]
  if (typeContent && typeContent[tone]?.[length]) {
    return typeContent[tone][length]
  }
  const fallback = FALLBACK_CONTENT[tone]?.[length]?.[contentType]
  if (fallback) {
    return `**${topic}**\n\n${fallback}`
  }
  const generic = FALLBACK_CONTENT[tone]?.[length]?.paragraph
  if (generic) {
    return `**${topic}**\n\n${generic}`
  }
  return `**${topic}**\n\nAn insightful piece about ${topic} written in a ${tone.toLowerCase()} tone. This ${length.toLowerCase()} piece explores key themes, provides actionable insights, and delivers value to the reader.`
}

export function AiWriter() {
  const [topic, setTopic] = React.useState("")
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Professional")
  const [length, setLength] = React.useState<(typeof LENGTHS)[number]>("Medium")
  const [contentType, setContentType] = React.useState<(typeof CONTENT_TYPES)[number]["value"]>("paragraph")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    setLoading(true)
    setProgress(0)
    setOutput("")

    const targetWords = LENGTH_WORDS[length]
    const content = getContent(tone, length, contentType, topic)
    const wordCount = content.split(/\s+/).length
    const adjusted = wordCount < targetWords
      ? content + `\n\n_Word count: ~${targetWords} words | Tone: ${tone} | Format: ${contentType}_`
      : content

    setProgress(100)
    setOutput(adjusted)
    setLoading(false)
    toast.success(`${contentType} generated in ${tone.toLowerCase()} tone`)
  }, [topic, tone, length, contentType])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output.replace(/\*\*/g, ""))
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Pen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Writer</h1>
          <p className="text-sm text-muted-foreground">Generate content with AI — essays, emails, stories, articles & more</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <Input
          label="Topic"
          placeholder="Enter your topic or subject..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  tone === t
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30 hover:bg-accent/50"
                )}
              >
                {TONE_ICONS[t]} {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Length</label>
            <div className="flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                    length === l
                      ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary/30"
                  )}
                >
                  {l}
                  <div className="mt-0.5 text-[10px] font-normal text-muted-foreground">~{LENGTH_WORDS[l]} words</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Content Type</label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setContentType(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                    contentType === f.value
                      ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary/30"
                  )}
                >
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Content
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Generating..." />
        )}
      </Card>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-3 text-sm font-medium text-foreground capitalize">
                {contentType} — {tone} · {length.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {copied ? (
                  <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                ) : (
                  <><Copy className="h-3.5 w-3.5" /> Copy</>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </motion.button>
            </div>
          </div>
          <div className="p-5">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-foreground">
              {output.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={i} className="font-semibold text-foreground">
                      {part.slice(2, -2)}
                    </strong>
                  )
                }
                return part
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
