
import { TextStats, SEOHealth, EEATScore, EEATCategoryScore } from '../types/editor.types.ts';

// Heuristics for scoring
const experienceKeywords = ['i believe', 'in my experience', 'i found that', 'we tested', 'our results showed', 'case study', 'example', 'step-by-step', 'personally'];
const expertiseKeywords = ['because', 'which means', 'technically', 'the reason is', 'for instance', 'definition', 'consequently', 'in depth'];
const authorityKeywords = ['according to', 'research from', 'study by', 'data shows', 'statistics', 'source:', 'report by', 'expert'];
const spammyKeywords = ['guaranteed', '100% free', 'no risk', 'act now', 'limited time', 'miracle', 'secret formula', 'buy now'];

export const analyzeEEAT = (
    htmlContent: string,
    stats: TextStats,
    health: SEOHealth,
    metaTitle: string,
    metaDescription: string
): EEATScore => {
    const cleanText = htmlContent.replace(/<[^>]*>/g, ' ').toLowerCase();

    // --- Experience Score (0-100) ---
    let experienceScore = 10; // Base score
    experienceKeywords.forEach(kw => {
        if (cleanText.includes(kw)) experienceScore += 8;
    });
    const firstPersonCount = (cleanText.match(/\b(i|we|my|our)\b/g) || []).length;
    experienceScore += Math.min(25, firstPersonCount * 2.5);
    if (stats.words < 400) experienceScore -= 15;
    experienceScore = Math.max(0, Math.min(100, Math.round(experienceScore)));

    // --- Expertise Score (0-100) ---
    let expertiseScore = 10; // Base score
    expertiseKeywords.forEach(kw => {
        if (cleanText.includes(kw)) expertiseScore += 7;
    });
    if (stats.words > 1200) expertiseScore += 20;
    if (stats.readingTime > 6) expertiseScore += 15;
    if (stats.sentences < 25) expertiseScore -= 20;
    expertiseScore = Math.max(0, Math.min(100, Math.round(expertiseScore)));

    // --- Authority Score (0-100) ---
    let authorityScore = 5; // Base score
    authorityScore += Math.min(45, health.linkStats.external * 15);
    authorityKeywords.forEach(kw => {
        if (cleanText.includes(kw)) authorityScore += 9;
    });
    const numberCount = (cleanText.match(/\b\d+([\.,]\d+)?%?\b/g) || []).length;
    authorityScore += Math.min(20, numberCount * 4);
    if (health.linkStats.external === 0 && stats.words > 600) authorityScore -= 25;
    authorityScore = Math.max(0, Math.min(100, Math.round(authorityScore)));

    // --- Trust Score (0-100) ---
    let trustScore = 40; // Base trust
    if (metaTitle.length > 40 && metaTitle.length < 65) trustScore += 15;
    if (metaDescription.length > 120 && metaDescription.length < 165) trustScore += 15;
    if (stats.headingTree.filter(h => h.tag === 'h2').length > 1) trustScore += 15;
    
    let spamPenalty = 0;
    spammyKeywords.forEach(kw => {
        if (cleanText.includes(kw)) spamPenalty += 12;
    });
    trustScore -= spamPenalty;
    
    const exclamationCount = (cleanText.match(/!/g) || []).length;
    if (exclamationCount > 4) trustScore -= (exclamationCount * 4);
    trustScore = Math.max(0, Math.min(100, Math.round(trustScore)));

    const overallScore = Math.round((experienceScore + expertiseScore + authorityScore + trustScore) / 4);

    const getCategoryDetails = (score: number, name: string): EEATCategoryScore => {
        let status: 'Strong' | 'Moderate' | 'Weak' = 'Weak';
        let color = 'text-red-500';
        if (score >= 75) { status = 'Strong'; color = 'text-emerald-500'; }
        else if (score >= 50) { status = 'Moderate'; color = 'text-yellow-500'; }
        return { name, score, status, color };
    };

    const getSummary = (score: number): string => {
        if (score >= 80) return "Excellent signals of E-E-A-T.";
        if (score >= 60) return "Good E-E-A-T foundation, but needs more depth.";
        if (score >= 40) return "Lacks sufficient signals of experience and authority.";
        return "Content shows very few E-E-A-T signals.";
    };

    const getColor = (score: number): string => {
        if (score >= 75) return 'text-emerald-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return {
        overall: overallScore,
        summary: getSummary(overallScore),
        color: getColor(overallScore),
        experience: getCategoryDetails(experienceScore, 'Experience'),
        expertise: getCategoryDetails(expertiseScore, 'Expertise'),
        authority: getCategoryDetails(authorityScore, 'Authority'),
        trust: getCategoryDetails(trustScore, 'Trust'),
    };
};
