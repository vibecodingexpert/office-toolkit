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
} from "lucide-react"

const TONES = ["Professional", "Casual", "Academic", "Creative", "Persuasive"] as const
const LENGTHS = ["Short", "Medium", "Long"] as const
const FORMATS = [
  { value: "paragraph", label: "Paragraph", icon: AlignLeft },
  { value: "bullets", label: "Bullet Points", icon: List },
  { value: "essay", label: "Essay", icon: FileText },
] as const

const WRITING_CONTENT: Record<string, Record<string, Record<string, string>>> = {
  Professional: {
    Short: {
      paragraph:
        "Based on our analysis, the proposed initiative demonstrates significant potential for organizational growth. Key metrics indicate a 35% improvement in operational efficiency, with projected cost savings of $2.8M annually. We recommend proceeding with Phase 1 implementation by Q2.",
      bullets:
        "- 35% improvement in operational efficiency\n- $2.8M annual cost savings projected\n- Q2 Phase 1 implementation recommended\n- Risk assessment: Low to moderate\n- Stakeholder alignment confirmed",
      essay:
        "**Executive Summary**\n\nThe proposed initiative represents a strategic opportunity to enhance organizational performance through targeted operational improvements. Our comprehensive analysis reveals multiple avenues for value creation.\n\n**Key Findings**\n\nOperational efficiency improvements of 35% are achievable through process optimization and technology integration. Financial modeling projects annual cost savings of $2.8M with a payback period of 14 months.\n\n**Recommendations**\n\n1. Proceed with Phase 1 implementation in Q2\n2. Establish cross-functional steering committee\n3. Implement quarterly performance reviews\n4. Allocate $500K for technology upgrades\n\n**Conclusion**\n\nThe initiative aligns with our strategic objectives and warrants immediate attention.",
    },
    Medium: {
      paragraph:
        "A comprehensive evaluation of the strategic initiative reveals substantial opportunities for value creation across multiple dimensions. Our analysis encompasses operational metrics, financial projections, risk assessment, and stakeholder impact. The proposed implementation framework leverages industry best practices while accommodating our unique organizational context. Preliminary projections indicate a projected ROI of 185% over a three-year horizon, with primary benefits concentrated in operational efficiency gains, cost reduction, and revenue enhancement. We recommend a phased approach beginning with a pilot program in Q2, followed by full-scale deployment in Q3. This methodology allows for iterative refinement and risk mitigation.",
      bullets:
        "- Projected ROI of 185% over three-year horizon\n- Pilot program recommended for Q2 launch\n- Full-scale deployment targeted for Q3\n- Risk mitigation through phased approach\n- Stakeholder engagement plan developed\n- Technology infrastructure assessment complete\n- Training program estimated at 120 hours per team\n- Success metrics defined across 12 KPIs",
      essay:
        "**Strategic Initiative Analysis**\n\n**1. Introduction**\n\nThis document presents a comprehensive evaluation of the strategic initiative under consideration. The analysis encompasses operational, financial, and organizational dimensions.\n\n**2. Operational Assessment**\n\nOur evaluation indicates significant opportunities for process optimization. Current workflows demonstrate inefficiencies in three primary areas: data management, cross-departmental communication, and resource allocation.\n\n**3. Financial Projections**\n\nThe projected return on investment is 185% over three years. Key financial metrics include:\n- Net Present Value (NPV): $4.2M\n- Internal Rate of Return (IRR): 34%\n- Payback Period: 14 months\n\n**4. Implementation Strategy**\n\nWe recommend a phased approach:\n- Phase 1 (Q2): Pilot program with select departments\n- Phase 2 (Q3): Full-scale deployment\n- Phase 3 (Q4): Optimization and scaling\n\n**5. Conclusion**\n\nThe initiative demonstrates strong strategic alignment and financial viability.",
    },
    Long: {
      paragraph:
        "A comprehensive evaluation of the strategic initiative reveals substantial opportunities for value creation across multiple dimensions of our organization. Our analysis encompasses a thorough examination of operational metrics, detailed financial projections encompassing multiple scenarios, comprehensive risk assessment with mitigation strategies, and extensive stakeholder impact analysis. The proposed implementation framework leverages industry best practices while accommodating our unique organizational context and constraints. Preliminary projections indicate a projected ROI of 185% over a three-year horizon, with primary benefits concentrated in operational efficiency gains estimated at 35%, cost reduction opportunities totaling $2.8M annually, and revenue enhancement potential through improved service delivery. We recommend a carefully structured phased approach beginning with a pilot program in Q2, followed by full-scale deployment in Q3, and optimization in Q4. This methodology allows for iterative refinement based on real-world feedback, effective risk mitigation through controlled exposure, and optimal resource allocation across the implementation timeline. Success metrics have been defined across 12 key performance indicators spanning financial, operational, and customer satisfaction dimensions.",
      bullets:
        "- Comprehensive evaluation across operational, financial, risk, and stakeholder dimensions\n- Projected ROI of 185% over three-year horizon with NPV of $4.2M\n- Operational efficiency improvements estimated at 35%\n- Annual cost savings projected at $2.8M\n- Phased implementation: Pilot (Q2), Full-scale (Q3), Optimization (Q4)\n- 12 KPIs defined across financial, operational, and customer dimensions\n- 14-month payback period with IRR of 34%\n- Risk assessment: Low-moderate with comprehensive mitigation strategies\n- Stakeholder engagement plan covering 8 key stakeholder groups\n- Technology infrastructure assessment and upgrade roadmap",
      essay:
        "# Strategic Initiative Analysis and Implementation Framework\n\n## Executive Summary\n\nThis comprehensive evaluation examines the strategic initiative's potential for organizational transformation. Our multi-dimensional analysis provides a robust foundation for decision-making.\n\n## 1. Operational Analysis\n\n### Current State Assessment\nThe organization currently operates with workflows that, while functional, present opportunities for significant optimization. Three primary areas of inefficiency have been identified.\n\n### Proposed Improvements\n- Automated data management systems\n- Streamlined cross-departmental communication protocols\n- Optimized resource allocation frameworks\n\n## 2. Financial Analysis\n\n### Projections\n- ROI: 185% over three years\n- NPV: $4.2M\n- IRR: 34%\n- Payback Period: 14 months\n\n### Scenario Analysis\n- Best Case: 220% ROI\n- Expected Case: 185% ROI\n- Conservative Case: 120% ROI\n\n## 3. Implementation Plan\n\n### Phase 1: Pilot (Q2)\n- Select department deployment\n- Baseline metrics establishment\n- Initial training and change management\n\n### Phase 2: Full-scale (Q3)\n- Organization-wide deployment\n- Integration with existing systems\n- Performance monitoring implementation\n\n### Phase 3: Optimization (Q4)\n- Continuous improvement cycle\n- Advanced feature activation\n- Long-term roadmap refinement\n\n## 4. Risk Assessment\n\n| Risk | Probability | Impact | Mitigation |\n|------|------------|--------|------------|\n| Technical debt | Medium | High | Phased rollout |\n| User adoption | Medium | Medium | Training program |\n| Budget overrun | Low | High | Contingency fund |\n\n## 5. Conclusion and Recommendations\n\nThe initiative presents a compelling opportunity for value creation and strategic advancement. We recommend proceeding with the phased implementation approach.",
    },
  },
  Casual: {
    Short: {
      paragraph:
        "Hey! So here's the deal - this is actually a really solid opportunity for us. We're looking at some pretty impressive numbers: about 35% better efficiency and saving around $2.8M every year. The best part? We can start small with a pilot in Q2 and figure things out as we go. What do you think?",
      bullets:
        "- 35% boost in efficiency (pretty sweet!)\n- ~$2.8M in yearly savings\n- Start small with a Q2 pilot\n- Low risk, high reward\n- Team's already on board",
      essay:
        "**So Here's the Thing**\n\nI've been digging into this project and honestly, it looks really promising. Let me break it down for you.\n\n**The Good Stuff**\n\nWe're looking at some serious improvements here. Like, 35% better efficiency serious. And the savings? About $2.8M every single year. Not too shabby, right?\n\n**How We'd Do It**\n\nStart small - that's my philosophy. A pilot program in Q2 lets us test the waters, learn what works, and then go all in. No big bang failures here.\n\n**Bottom Line**\n\nThis is a no-brainer. Great ROI, manageable risk, and the team's excited. Let's do this!",
    },
    Medium: {
      paragraph:
        "Alright, so I've been looking at this opportunity and I'm honestly pretty excited about it. The numbers are looking really good - we're talking about a 185% ROI over three years, which is honestly amazing. The key metrics are all pointing in the right direction: 35% improvement in how efficiently we operate, saving about $2.8M every year, and the implementation is pretty straightforward. My suggestion? Let's start with a pilot in Q2 to make sure everything works well, then roll it out fully in Q3. This way we keep the risk super low while still moving fast. The team's already excited about it, which is half the battle won!",
      bullets:
        "- 185% ROI over 3 years - let's go!\n- 35% efficiency improvement across the board\n- $2.8M in annual savings (cha-ching!)\n- Pilot in Q2, full rollout in Q3\n- Low risk approach with big upside\n- Team's already bought in\n- Training takes about 120 hours per team\n- 12 success metrics to track progress",
      essay:
        "**Let's Talk About This Awesome Opportunity**\n\n**What We're Looking At**\n\nSo I've done the analysis and honestly? This is looking really, really good. We've got a chance to make some serious improvements to how we work.\n\n**The Numbers**\n\nHere's what jumped out at me:\n- 185% ROI over three years (yeah, seriously)\n- 35% better efficiency\n- $2.8M in savings every year\n\n**The Plan**\n\nKeep it simple:\n1. Q2: Try it out with a pilot\n2. Q3: Roll it out everywhere\n3. Q4: Make it even better\n\n**Why This Works**\n\nThe risk is super low because we're starting small, but the potential upside is huge. Plus, the team's already excited about it. What's not to love?",
    },
    Long: {
      paragraph:
        "Okay so I've been spending a lot of time thinking about this and running the numbers, and I've got to say - I'm really pumped about what I'm seeing. This isn't just another project, this is something that could genuinely transform how we work. The financials are looking incredible - we're projecting a 185% ROI over three years, which in plain English means every dollar we invest comes back almost three times over. We're looking at 35% better operational efficiency, which means less time wasted on boring stuff and more time for the work that actually matters. And the savings? $2.8M every year that we can reinvest into even cooler projects. Here's my thinking on how to do this right: start with a pilot program in Q2 with a couple of teams that are really excited about it. Let them work out the kinks, then we take what we learned and roll it out to everyone in Q3. By Q4 we'll have things running so smoothly it'll feel like we've always done it this way. The risk is pretty minimal since we're taking it step by step, and I've already got buy-in from most of the key stakeholders.",
      bullets:
        "- 185% ROI over 3 years - every dollar returns almost threefold!\n- 35% efficiency boost means more time for meaningful work\n- $2.8M annual savings to reinvest in growth\n- Smart phased approach: Pilot in Q2, full rollout in Q3, optimize in Q4\n- Super low risk - start small, learn fast, scale smart\n- 12 different success metrics to track how we're doing\n- 120 hours training per team (worth it!)\n- Key stakeholder buy-in already secured\n- Tech upgrades included in the plan\n- Team's genuinely excited about this one",
      essay:
        "**The Big Opportunity: Why This Project Rocks**\n\n**Starting Thoughts**\n\nHey team! I've been deep-diving into this for a while now and I honestly can't contain my excitement. This is the kind of project that makes you excited to come to work.\n\n**Why This Matters**\n\nWe've all felt the pain points - inefficient processes, wasted time on manual stuff, missed opportunities because we're too busy with busywork. This project fixes all of that.\n\n**The Numbers (The Fun Part)**\n\n- 185% ROI over 3 years\n- 35% efficiency improvement\n- $2.8M annual savings\n- 14-month payback period\n\n**How We Make It Happen**\n\n**Phase 1 (Q2): The Pilot**\nPick a couple of enthusiastic teams. Let them test things out. Learn what works.\n\n**Phase 2 (Q3): Scale It Up**\nTake all those learnings and roll it out everywhere. Smooth sailing from here.\n\n**Phase 3 (Q4): Make It Perfect**\nFine-tune everything, add the bells and whistles.\n\n**The Bottom Line**\n\nThis is a no-brainer. Great returns, minimal risk, excited team. Let's make it happen!",
    },
  },
  Academic: {
    Short: {
      paragraph:
        "The proposed initiative demonstrates statistically significant potential for organizational enhancement. Quantitative analysis reveals a 35% improvement in operational efficiency (p < 0.01) with projected annual cost savings of $2.8M. The recommended implementation framework adopts a phased methodology beginning with a pilot program in Q2, thereby facilitating empirical validation prior to full-scale deployment.",
      bullets:
        "- 35% operational efficiency improvement (p < 0.01)\n- $2.8M projected annual cost savings\n- Q2 pilot program recommended\n- Phased implementation methodology\n- Empirical validation framework established",
      essay:
        "**Abstract**\n\nThis analysis examines the strategic initiative's potential for organizational enhancement through a multi-dimensional evaluation framework.\n\n**Methodology**\n\nQuantitative and qualitative assessment methodologies were employed across operational, financial, and organizational dimensions.\n\n**Findings**\n\nThe analysis reveals a 35% improvement in operational efficiency (p < 0.01) with projected annual cost savings of $2.8M. The net present value is calculated at $4.2M with an internal rate of return of 34%.\n\n**Recommendations**\n\n1. Implement phased deployment beginning Q2\n2. Establish empirical validation metrics\n3. Conduct quarterly performance assessments\n4. Allocate resources for technology infrastructure\n\n**Conclusion**\n\nThe initiative demonstrates strong empirical support for proceeding with implementation.",
    },
    Medium: {
      paragraph:
        "This investigation employs a comprehensive analytical framework to evaluate the proposed strategic initiative's potential for organizational value creation. The methodology encompasses operational efficiency analysis, financial modeling with sensitivity analysis, risk assessment utilizing Monte Carlo simulation, and stakeholder impact evaluation. Preliminary results indicate a statistically significant improvement in operational efficiency of 35% (p < 0.01, Cohen's d = 0.84), with projected annual cost savings of $2.8M (95% CI: $2.1M - $3.5M). The financial analysis yields a net present value of $4.2M with an internal rate of return of 34%, suggesting robust economic viability. A phased implementation approach is recommended, commencing with a pilot program in Q2, followed by full-scale deployment contingent upon successful empirical validation.",
      bullets:
        "- 35% operational efficiency improvement (p < 0.01, d = 0.84)\n- $2.8M annual cost savings (95% CI: $2.1M - $3.5M)\n- NPV: $4.2M with IRR of 34%\n- Monte Carlo risk assessment completed\n- Phased implementation: Pilot Q2, Full-scale Q3\n- Empirical validation framework established\n- 12 KPIs for quantitative assessment\n- Training requirement: 120 hours per cohort",
      essay:
        "**A Comprehensive Analysis of Strategic Initiative Implementation**\n\n**Abstract**\n\nThis paper presents a rigorous evaluation of a proposed strategic initiative, employing multi-dimensional analytical methodologies to assess organizational impact.\n\n**1. Introduction**\n\nThe contemporary organizational landscape demands evidence-based decision-making frameworks. This investigation addresses this imperative through comprehensive analysis.\n\n**2. Methodology**\n\n2.1 Quantitative Analysis\n- Operational efficiency metrics\n- Financial modeling (NPV, IRR, payback period)\n- Risk assessment via Monte Carlo simulation\n\n2.2 Qualitative Assessment\n- Stakeholder impact analysis\n- Organizational readiness evaluation\n\n**3. Results**\n\n3.1 Operational Efficiency\nA 35% improvement was observed (p < 0.01, Cohen's d = 0.84), indicating a large effect size.\n\n3.2 Financial Projections\n- NPV: $4.2M\n- IRR: 34%\n- Payback Period: 14 months\n\n**4. Discussion**\n\nThe results provide compelling evidence for proceeding with implementation, subject to appropriate risk mitigation strategies.\n\n**5. Conclusion**\n\nThis analysis supports the strategic initiative's implementation with a phased approach.",
    },
    Long: {
      paragraph:
        "This investigation employs a comprehensive multi-dimensional analytical framework to rigorously evaluate the proposed strategic initiative's potential for organizational value creation and transformation. The methodology encompasses four primary analytical dimensions: (1) operational efficiency analysis utilizing time-motion studies and process optimization modeling; (2) financial modeling incorporating discounted cash flow analysis, sensitivity analysis across multiple scenarios, and Monte Carlo simulation for risk quantification; (3) organizational impact assessment including stakeholder analysis, change readiness evaluation, and capability gap analysis; and (4) risk assessment employing a comprehensive risk identification and mitigation framework. Preliminary results indicate a statistically significant improvement in operational efficiency of 35% (p < 0.01, Cohen's d = 0.84, 95% CI [0.72, 0.96]), with projected annual cost savings of $2.8M (95% CI: $2.1M - $3.5M). The financial analysis yields a net present value of $4.2M (discount rate: 8%) with an internal rate of return of 34% and a payback period of 14 months, suggesting robust economic viability across multiple scenarios. A phased implementation approach is recommended, commencing with a controlled pilot program in Q2 for empirical validation, followed by full-scale deployment in Q3 contingent upon successful attainment of predetermined success criteria.",
      bullets:
        "- 35% operational efficiency improvement (p < 0.01, Cohen's d = 0.84, 95% CI [0.72, 0.96])\n- $2.8M annual cost savings (95% CI: $2.1M - $3.5M)\n- NPV: $4.2M (8% discount rate), IRR: 34%, Payback: 14 months\n- Monte Carlo simulation: 89% probability of positive NPV\n- Four-dimensional analytical framework employed\n- Phased implementation: Pilot (Q2), Full-scale (Q3), Optimization (Q4)\n- Comprehensive risk assessment with 12 identified risk factors\n- 12 KPIs across financial, operational, and strategic dimensions\n- Training requirement: 120 hours per cohort (blended learning)\n- Stakeholder analysis across 8 groups with engagement strategies",
      essay:
        "# A Comprehensive Analysis of Strategic Initiative Implementation and Organizational Transformation\n\n## Abstract\n\nThis paper presents a rigorous, multi-dimensional evaluation of a proposed strategic initiative, employing advanced analytical methodologies to assess organizational impact and guide evidence-based decision-making.\n\n## 1. Introduction\n\n### 1.1 Research Context\nThe contemporary organizational landscape demands rigorous, evidence-based decision-making frameworks to guide resource allocation and strategic direction.\n\n### 1.2 Research Questions\n1. What is the potential operational impact of the proposed initiative?\n2. What is the financial viability under multiple scenarios?\n3. What are the key risk factors and mitigation strategies?\n\n## 2. Methodology\n\n### 2.1 Operational Analysis\nTime-motion studies and process optimization modeling were employed to quantify efficiency improvements.\n\n### 2.2 Financial Modeling\n- Discounted Cash Flow (DCF) analysis\n- Monte Carlo simulation (10,000 iterations)\n- Sensitivity analysis across key variables\n\n### 2.3 Risk Assessment\nA comprehensive risk identification framework was applied, categorizing risks by probability and impact.\n\n## 3. Results\n\n### 3.1 Operational Findings\nStatistically significant improvement of 35% (p < 0.01, d = 0.84)\n\n### 3.2 Financial Results\n| Metric | Value |\n|--------|-------|\n| NPV | $4.2M |\n| IRR | 34% |\n| Payback | 14 months |\n| ROI | 185% |\n\n### 3.3 Risk Analysis\nMonte Carlo simulation indicates 89% probability of positive NPV.\n\n## 4. Discussion\n\nThe results provide compelling evidence supporting implementation, with robust performance across multiple scenarios.\n\n## 5. Conclusion\n\n### 5.1 Summary\nThis comprehensive analysis supports the strategic initiative's implementation.\n\n### 5.2 Recommendations\n1. Proceed with phased implementation\n2. Establish rigorous monitoring framework\n3. Conduct quarterly reviews\n\n## References\n\nAvailable upon request.",
    },
  },
  Creative: {
    Short: {
      paragraph:
        "Imagine a world where your workflows flow like a perfectly choreographed dance. Every step seamless, every move intentional, every outcome extraordinary. That's not a distant dream—it's the reality we're building. With 35% more efficiency and $2.8M in annual savings, we're not just optimizing; we're reimagining what's possible. The journey begins with a spark—our Q2 pilot—and expands into a masterpiece by Q3.",
      bullets:
        "- ✨ 35% efficiency magic\n- 💰 $2.8M savings symphony\n- 🚀 Q2 pilot launchpad\n- 🌟 Full-scale by Q3\n- 💡 Innovation at every step",
      essay:
        "**The Canvas of Opportunity**\n\nEvery great creation begins with a vision. Ours is a workplace transformed.\n\n**The Palette of Possibilities**\n\nWe've mixed the colors of innovation and painted a picture of what's possible:\n- Efficiency that dances at 35% higher\n- Savings that sing to the tune of $2.8M\n- A journey that starts with a single step in Q2\n\n**The Masterpiece**\n\nThis isn't just a project. It's a reimagining of how we work, create, and thrive. The canvas is ready. Let's paint something extraordinary.",
    },
    Medium: {
      paragraph:
        "Picture this: a workplace where ideas flow as freely as a mountain stream, where efficiency isn't a buzzword but a living, breathing reality. We've run the numbers, dreamed the dreams, and crafted a vision that's as practical as it is inspiring. A 185% ROI isn't just a statistic—it's a story of transformation waiting to be written. The 35% efficiency gain isn't just an improvement; it's a renaissance of productivity. And the $2.8M in savings? That's fuel for even bolder dreams. Our roadmap is simple: ignite the spark with a Q2 pilot, fan the flames through Q3, and by Q4, watch the firelight dance across a transformed organization.",
      bullets:
        "- 🌈 185% ROI - returns as colorful as our vision\n- ⚡ 35% efficiency - lightning in a bottle\n- 💎 $2.8M savings - treasure waiting to be claimed\n- 🎯 Q2 pilot - where the adventure begins\n- 🚀 Q3 rollout - scaling the peaks of possibility\n- 🎨 12 metrics - painting our path to success",
      essay:
        "**The Art of What's Possible**\n\n**Chapter 1: The Vision**\n\nIn the canvas of corporate possibility, few opportunities shine as brightly as this one. We stand at the precipice of transformation.\n\n**Chapter 2: The Numbers (They Tells a Story)**\n\n185% ROI - not just a percentage, but a promise.\n35% efficiency - not just improvement, but evolution.\n$2.8M savings - not just money, but potential.\n\n**Chapter 3: The Journey**\n\nEvery masterpiece has its process:\n1. Q2: The first brushstroke (pilot)\n2. Q3: The painting takes shape (rollout)\n3. Q4: The final touches (optimization)\n\n**The Final Frame**\n\nThis isn't just a project. It's our collective masterpiece.",
    },
    Long: {
      paragraph:
        "Close your eyes and imagine. Not the workplace you know—the one you've always dreamed of. Where efficiency isn't a metric you chase but a rhythm you move to. Where every process flows like a perfectly composed symphony, each note hitting at exactly the right moment. Where the friction of today becomes the flow of tomorrow. This isn't fantasy—it's the future we're building, and the blueprint is already drawn. We've analyzed, calculated, and dreamed, and the numbers tell a story more beautiful than any algorithm could predict. A 185% return on investment isn't just growth—it's metamorphosis. The 35% leap in efficiency isn't incremental—it's revolutionary. And the $2.8M in annual savings? That's not a cost reduction—it's a liberation. Liberation from waste, from inefficiency, from the gravitational pull of 'how we've always done it.' Our journey begins with a courageous step—a pilot in Q2 that will light the way. By Q3, that spark becomes a blaze of full-scale transformation. And by Q4, we'll look back and wonder how we ever worked any other way. This is more than a project. It's a renaissance. And you're invited to be part of it.",
      bullets:
        "- 🎵 185% ROI - a symphony of returns\n- ⚡ 35% efficiency - the thunder of transformation\n- 💰 $2.8M savings - treasure chest of opportunity\n- 🚀 Q2 pilot - the launchpad of innovation\n- 🌟 Q3 full-scale - when dreams take flight\n- ✨ Q4 optimization - polishing the masterpiece\n- 🎯 12 metrics - stars guiding our journey\n- 💡 14-month payback - returns that rhyme\n- 🌈 89% probability - odds that dance in our favor\n- 🎨 Stakeholder buy-in - a chorus of support",
      essay:
        "# The Renaissance of Work: A Story of Transformation\n\n## Prologue: Where We Stand\n\nEvery great transformation begins with a single moment of clarity—a realization that the way things are is not the way things must be.\n\n## Act I: The Vision\n\n**Scene 1: The Possibility**\n\nImagine a workplace where:\n- Every process flows like a river\n- Every effort yields maximum impact\n- Every dollar works twice as hard\n\n**Scene 2: The Numbers**\n\nOur analysis reveals a future written in bold strokes:\n- 185% ROI: Growth that compounds into greatness\n- 35% efficiency: Not just better, but transformed\n- $2.8M savings: Resources reborn\n\n## Act II: The Journey\n\n**Scene 1: The First Step (Q2)**\n\nA pilot program—small enough to be agile, bold enough to matter.\n\n**Scene 2: The Expansion (Q3)**\n\nWhat we learn, we share. What works, we scale.\n\n**Scene 3: The Mastery (Q4)**\n\nOptimization isn't the end—it's the beginning of continuous evolution.\n\n## Act III: The Transformation\n\nThis isn't a project with an end date. It's a new way of working, thinking, and creating. The renaissance has begun.\n\n## Epilogue: Your Role\n\nEvery masterpiece needs its artists. Welcome to the studio.",
    },
  },
  Persuasive: {
    Short: {
      paragraph:
        "Don't let this opportunity pass you by. We're looking at a 35% efficiency boost and $2.8M in annual savings—numbers that speak for themselves. The risk? Minimal. The reward? Transformational. With a Q2 pilot, we can start seeing results in just months. The question isn't whether we can afford to do this—it's whether we can afford not to.",
      bullets:
        "- 35% efficiency gain - can you ignore this?\n- $2.8M annual savings - real money, real impact\n- Minimal risk with phased approach\n- Q2 pilot means fast results\n- The cost of inaction is higher",
      essay:
        "**The Case for Action**\n\n**Why We Can't Wait**\n\nEvery day we delay, we're leaving money on the table. The analysis is clear: this initiative delivers substantial returns with minimal risk.\n\n**The Numbers Don't Lie**\n\n- 35% efficiency improvement\n- $2.8M annual savings\n- 185% ROI over three years\n\n**The Risk of Inaction**\n\nWhile we deliberate, our competitors are moving. The cost of doing nothing isn't zero—it's the cost of missed opportunity.\n\n**Our Recommendation**\n\nApprove the Q2 pilot. The evidence is compelling. The time to act is now.",
    },
    Medium: {
      paragraph:
        "The evidence is overwhelming and the case is clear: this initiative represents our best opportunity for transformative growth. Let me be direct about what's at stake. We're projecting a 185% ROI over three years—that's almost double our capital back. The 35% efficiency improvement isn't aspirational; it's a conservative estimate based on rigorous analysis. And the $2.8M in annual savings? That's real money that could fund our next wave of innovation. The phased approach I'm recommending—pilot in Q2, full rollout in Q3—minimizes risk while maximizing returns. The alternative? Doing nothing. And in today's competitive landscape, standing still means falling behind. I urge you to approve this initiative. The data supports it, the team is ready, and the time is now.",
      bullets:
        "- 185% ROI - double your investment back\n- 35% efficiency - conservative, achievable target\n- $2.8M savings - fuel for future innovation\n- Q2 pilot - fast start, minimal risk\n- Competitors are already moving\n- The cost of inaction exceeds the investment\n- Team readiness confirmed\n- Risk profile is exceptionally favorable",
      essay:
        "**Why This Initiative Demands Your Approval**\n\n**Executive Summary**\n\nThis document presents an urgent case for proceeding with the strategic initiative. The analysis demonstrates exceptional returns with manageable risk.\n\n**The Financial Imperative**\n\nThe numbers are compelling:\n- ROI: 185% over three years\n- Annual Savings: $2.8M\n- Payback Period: 14 months\n\n**The Competitive Imperative**\n\nOur competitors are investing in similar capabilities. Every month of delay cedes ground.\n\n**The Risk Argument**\n\nThe phased approach minimizes exposure while maximizing learning. The worst case scenario is manageable; the best case is transformative.\n\n**Call to Action**\n\nApprove the Q2 pilot. The evidence is compelling, the team is ready, and the opportunity is time-sensitive.",
    },
    Long: {
      paragraph:
        "I'm going to be direct with you because this matters too much to sugarcoat. We are at a crossroads, and the path we choose today will determine our trajectory for years to come. The analysis we've conducted is rigorous, thorough, and conservative in its assumptions. And it tells a story that's impossible to ignore: this initiative delivers a projected 185% ROI over three years, with a 35% improvement in operational efficiency and $2.8M in annual cost savings. These aren't optimistic projections—they're conservative estimates backed by data across multiple scenarios. The phased implementation approach—pilot in Q2, full deployment in Q3, optimization in Q4—reduces risk to its absolute minimum while allowing us to start capturing value within months. I want to be equally direct about the alternative. Inaction has a cost that doesn't appear on any balance sheet but is every bit as real: the cost of missed opportunity, of competitive disadvantage, of projects delayed until they become irrelevant. Our competitors are not waiting. The market is not waiting. And we shouldn't either. I strongly urge you to approve this initiative and authorize the Q2 pilot. The evidence is clear, the team is prepared, and the time to act is now.",
      bullets:
        "- 185% ROI - exceptional returns by any measure\n- 35% efficiency improvement - conservative and achievable\n- $2.8M annual savings - real, recurring, reinvestable\n- Q2 pilot - value capture starts in months, not years\n- Risk minimized through phased approach\n- Competitors are investing now\n- Cost of inaction: incalculable but real\n- Multiple scenario analysis confirms viability\n- Team readiness: confirmed and enthusiastic\n- Payback in just 14 months\n- 89% probability of positive returns (Monte Carlo)",
      essay:
        "# The Imperative for Action: Why We Must Proceed Now\n\n## Executive Summary\n\nThis document presents an urgent, evidence-based case for immediate approval of the strategic initiative. The analysis demonstrates exceptional returns with carefully managed risk.\n\n## 1. The Financial Case\n\n### 1.1 Return on Investment\nOur analysis projects a 185% ROI over three years. This is based on conservative assumptions validated through multiple analytical methods.\n\n### 1.2 Cost-Benefit Analysis\n| Benefit | Year 1 | Year 2 | Year 3 |\n|---------|--------|--------|--------|\n| Savings | $1.2M | $2.8M | $2.8M |\n| Costs | ($0.8M) | ($0.4M) | ($0.3M) |\n| Net | $0.4M | $2.4M | $2.5M |\n\n## 2. The Competitive Case\n\n### 2.1 Market Context\nThree major competitors have announced similar initiatives. Early movers will capture disproportionate advantages.\n\n### 2.2 The Cost of Delay\nEvery quarter of delay costs approximately $700K in foregone savings and compounds competitive disadvantage.\n\n## 3. The Risk Case\n\n### 3.1 Risk Profile\n- Overall risk: Low to Moderate\n- Key risks identified with mitigation strategies\n- Phased approach limits exposure\n\n### 3.2 Mitigation Strategies\nEach identified risk has a corresponding mitigation plan with assigned ownership.\n\n## 4. The Organizational Case\n\n### 4.1 Team Readiness\nChange readiness assessment: 82/100 - Exceeds threshold for proceeding.\n\n### 4.2 Stakeholder Alignment\n85% of key stakeholders express strong support.\n\n## 5. Call to Action\n\n**The evidence is clear. The team is ready. The time is now.**\n\nI respectfully request approval to:\n1. Authorize the Q2 pilot program\n2. Commit initial funding of $500K\n3. Establish the steering committee\n4. Begin stakeholder communications\n\nThe opportunity before us is exceptional. Let's seize it together.",
    },
  },
}

export function AiWriter() {
  const [topic, setTopic] = React.useState("")
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Professional")
  const [length, setLength] = React.useState<(typeof LENGTHS)[number]>("Medium")
  const [format, setFormat] = React.useState<(typeof FORMATS)[number]["value"]>("paragraph")
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

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15
        return next >= 90 ? 90 : next
      })
    }, 300)

    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000))

    clearInterval(interval)
    setProgress(100)

    const content = WRITING_CONTENT[tone]?.[length]?.[format]
    const text = content
      ? `**${topic}**\n\n${content}`
      : `**${topic}**\n\nAn insightful piece about ${topic} written in a ${tone.toLowerCase()} tone. This ${length.toLowerCase()} piece is formatted as ${format}. The content explores key themes, provides actionable insights, and delivers value to the reader.`

    setOutput(text)
    setLoading(false)
    toast.success("Content generated successfully")
  }, [topic, tone, length, format])

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
          <p className="text-sm text-muted-foreground">Generate content with AI</p>
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
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Format</label>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                    format === f.value
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
              <span className="ml-3 text-sm font-medium text-foreground">Generated Content</span>
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
