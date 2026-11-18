
import { TextStats, SEOHealth, ReadabilityInsights, SentenceWarnings, KeywordTarget, OptimizationReport, OptimizationItem, KeywordDensity, EEATScore } from '../types/editor.types.ts';

export const generateOptimizationReport = (
    stats: TextStats,
    health: SEOHealth,
    readability: ReadabilityInsights | null,
    sentenceWarnings: SentenceWarnings,
    targets: KeywordTarget,
    metaTitle: string,
    metaDescription: string,
    faqsCount: number,
    keywords: KeywordDensity[],
    eeatScore: EEATScore | null
): OptimizationReport => {
    const critical: OptimizationItem[] = [];
    const improvements: OptimizationItem[] = [];
    const enhancements: OptimizationItem[] = [];

    const primaryK = targets.primary.toLowerCase();
    const primaryDensity = keywords.find(k => k.phrase.toLowerCase() === primaryK)?.percentage || 0;

    // --- Critical Issues (Priority 1) ---
    const h1Count = stats.headingTree.filter(h => h.tag === 'h1').length;
    if (h1Count === 0) {
        critical.push({ id: 'c-h1-missing', title: 'Missing H1 Tag', description: 'Search engines need one main heading to understand the topic.', priority: 1, source: 'heading' });
    } else if (h1Count > 1) {
        critical.push({ id: 'c-h1-multi', title: 'Multiple H1 Tags', description: 'Use only one H1 tag per page to avoid confusion.', priority: 1, source: 'heading' });
    }

    if (!targets.primary) {
        critical.push({ id: 'c-key-missing', title: 'Set Primary Keyword', description: 'Define a target keyword to analyze ranking potential.', priority: 1, source: 'keyword' });
    } else {
        if (primaryDensity < 0.3) {
            critical.push({ id: 'c-dens-low', title: 'Primary Keyword Density Low', description: `Current density is ${primaryDensity}%. Aim for at least 0.8%.`, priority: 1, source: 'keyword' });
        }
        if (primaryDensity > 3) {
            critical.push({ id: 'c-dens-high', title: 'Primary Keyword Stuffing', description: `Density is ${primaryDensity}%. Reduce usage to avoid penalties (aim for < 2.5%).`, priority: 1, source: 'keyword' });
        }
    }

    if (health.score < 50) {
        critical.push({ id: 'c-seo-score', title: 'Critical SEO Score', description: 'Your overall SEO health is very low.', priority: 1, source: 'seo' });
    }
    
    if (!metaTitle) {
        critical.push({ id: 'c-meta-title', title: 'Missing Meta Title', description: 'Required for search results display.', priority: 1, source: 'seo' });
    }

    if (sentenceWarnings.veryLongSentences.length > 3) {
        critical.push({ id: 'c-long-sent', title: 'Hard to Read', description: `${sentenceWarnings.veryLongSentences.length} sentences are extremely long (>35 words).`, priority: 1, source: 'readability' });
    }

    // --- Improvements (Priority 2) ---
    
    if (targets.primary) {
        // Prominence checks
        if (health.prominenceScore < 60) {
             improvements.push({ id: 'i-prominence', title: 'Low Keyword Prominence', description: 'Ensure primary keyword appears in Title, H1, and first 100 words.', priority: 2, source: 'keyword' });
        }
        
        // Secondary checks
        const activeSecondaries = targets.secondary.filter(s => s.trim().length > 0);
        if (activeSecondaries.length === 0) {
             improvements.push({ id: 'i-sec-missing', title: 'Add Secondary Keywords', description: 'Targeting secondary keywords helps capture long-tail traffic.', priority: 2, source: 'keyword' });
        } else {
             // Check if any secondary is unused
             const unused = activeSecondaries.filter(sk => !keywords.some(k => k.phrase.toLowerCase() === sk.toLowerCase()));
             if (unused.length > 0) {
                 improvements.push({ id: 'i-sec-unused', title: 'Unused Secondary Keywords', description: `You haven't used: ${unused.join(', ')}`, priority: 2, source: 'keyword' });
             }
        }
    }

    if (health.score >= 50 && health.score < 80) {
        improvements.push({ id: 'i-seo-score', title: 'Improve SEO Score', description: 'Aim for a score of 80+ for better ranking potential.', priority: 2, source: 'seo' });
    }

    if (readability && readability.score < 60) {
        improvements.push({ id: 'i-readability', title: 'Improve Readability', description: 'Content is difficult to read for general audiences.', priority: 2, source: 'readability' });
    }

    if (sentenceWarnings.passiveVoice.length > 5) {
        improvements.push({ id: 'i-passive', title: 'Reduce Passive Voice', description: 'Active voice is more engaging and direct.', priority: 2, source: 'readability' });
    }

    const h2Count = stats.headingTree.filter(h => h.tag === 'h2').length;
    if (h2Count === 0 && stats.words > 300) {
        improvements.push({ id: 'i-h2-missing', title: 'Add Subheadings (H2)', description: 'Break up text with H2 headers for better scanning.', priority: 2, source: 'heading' });
    }

    if (stats.words < 300) {
        improvements.push({ id: 'i-word-count', title: 'Increase Word Count', description: 'Content is too thin (<300 words) to rank well.', priority: 2, source: 'content' });
    }

    if (eeatScore && eeatScore.experience.score < 50) {
        improvements.push({
            id: 'i-eeat-exp',
            title: 'Add First-Hand Experience',
            description: 'Incorporate personal stories, case studies, or real-world examples to demonstrate experience.',
            priority: 2,
            source: 'eeat'
        });
    }
    if (eeatScore && eeatScore.expertise.score < 50) {
        improvements.push({
            id: 'i-eeat-expert',
            title: 'Demonstrate Deeper Expertise',
            description: 'Expand on key concepts, define technical terms, and explain the "why" behind your statements.',
            priority: 2,
            source: 'eeat'
        });
    }

    // --- Enhancements (Priority 3) ---
    if (targets.primary && !stats.headingTree.some(h => h.tag === 'h2' && h.text.toLowerCase().includes(primaryK))) {
        enhancements.push({ id: 'e-h2-key', title: 'Keyword in Subheading', description: 'Add primary keyword to at least one H2.', priority: 3, source: 'keyword' });
    }

    if (faqsCount === 0) {
        enhancements.push({ id: 'e-faq', title: 'Add FAQ Schema', description: 'FAQ Schema helps capture rich snippets in SERPs.', priority: 3, source: 'seo' });
    }

    if (metaDescription && metaDescription.length < 120) {
        enhancements.push({ id: 'e-meta-desc', title: 'Expand Meta Description', description: 'Too short. Aim for 150-160 characters.', priority: 3, source: 'seo' });
    }
    
    if (eeatScore && eeatScore.authority.score < 60) {
        enhancements.push({
            id: 'e-eeat-auth',
            title: 'Build Authority with Citations',
            description: 'Add outbound links to credible sources, research papers, or expert opinions to support your claims.',
            priority: 3,
            source: 'eeat'
        });
    }
    if (eeatScore && eeatScore.trust.score < 60) {
        enhancements.push({
            id: 'e-eeat-trust',
            title: 'Increase Content Trustworthiness',
            description: 'Ensure meta tags are complete, headings are clear, and avoid using spammy or exaggerated language.',
            priority: 3,
            source: 'eeat'
        });
    }

    return { critical, improvements, enhancements };
}
