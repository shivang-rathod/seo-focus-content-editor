
import { SEOHealth, KeywordDensity, SEOChecklistItem, KeywordTarget, LinkStats, ScoreBreakdown } from '../types/editor.types';
import { getReadabilityScore } from './readability';

export const analyzeSEOHealth = (
  html: string, 
  keywords: KeywordDensity[], 
  targets: KeywordTarget,
  metaDescription: string,
  metaTitle: string = "",
  brokenLinks: string[] = [],
  targetDomain: string = ""
): SEOHealth => {
  const warnings: string[] = [];
  const checklist: SEOChecklistItem[] = [];
  let prominenceScore = 0;

  const cleanText = html.replace(/<[^>]*>/g, ' ').trim();
  const first100Words = cleanText.split(/\s+/).slice(0, 100).join(' ').toLowerCase();
  const primaryK = targets.primary ? targets.primary.toLowerCase() : '';

  // --- 1. Meta Score (Max 40) ---
  let metaScore = 0;
  
  // Title (25 pts max)
  const titleLen = metaTitle.length;
  const titleHasKey = primaryK && metaTitle.toLowerCase().includes(primaryK);
  const titleStartsWithKey = primaryK && metaTitle.toLowerCase().startsWith(primaryK);

  if (titleLen >= 50 && titleLen <= 60) metaScore += 15;
  else if (titleLen >= 40 && titleLen <= 70) metaScore += 10; // Slightly off
  else if (titleLen > 0) metaScore += 5; // At least present

  if (titleHasKey) metaScore += 10;
  // Bonus: Start with keyword (included in keyword score usually, but let's keep meta score clean)
  
  // Description (15 pts max)
  const descLen = metaDescription.length;
  const descHasKey = primaryK && metaDescription.toLowerCase().includes(primaryK);

  if (descLen >= 140 && descLen <= 160) metaScore += 10;
  else if (descLen >= 120 && descLen <= 180) metaScore += 5;
  else if (descLen > 0) metaScore += 2;

  if (descHasKey) metaScore += 5;

  // --- 2. Heading Structure (Max 15) ---
  let headingScore = 0;
  const h1Count = (html.match(/<h1/gi) || []).length;
  const h2Count = (html.match(/<h2/gi) || []).length;
  const h3Count = (html.match(/<h3/gi) || []).length;

  if (h1Count > 0) headingScore += 5;
  if (h1Count === 1) headingScore += 5;
  if (h2Count > 0 || h3Count > 0) headingScore += 5;

  // --- 3. Keyword Optimization (Max 20) ---
  let keywordScore = 0;
  const primaryDensityObj = keywords.find(k => k.phrase.toLowerCase() === primaryK);
  const density = primaryDensityObj ? primaryDensityObj.percentage : 0;

  if (primaryK) {
    keywordScore += 5; // Target set
    if (density >= 0.5 && density <= 2.5) keywordScore += 10;
    else if (density > 0 && density < 0.5) keywordScore += 5;
    
    // Prominence calc
    let localProminence = 0;
    // In H1
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match && h1Match[1].toLowerCase().includes(primaryK)) localProminence++;
    
    // In Intro
    if (first100Words.includes(primaryK)) localProminence++;

    // In URL (Not applicable here, but maybe we assume Meta Title is proxy? No.)
    // Let's use H2 presence for prominence
    if (h2Count > 0 && html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)?.some(h => h.toLowerCase().includes(primaryK))) localProminence++;

    if (localProminence >= 2) keywordScore += 5;
  }

  // --- 4. Content Quality (Max 15) ---
  let contentScore = 0;
  const wordCount = cleanText.split(/\s+/).length;
  const readScore = getReadabilityScore(html)?.score || 0;

  if (wordCount > 300) contentScore += 5;
  if (wordCount > 600) contentScore += 5;
  if (readScore >= 60) contentScore += 5;

  // --- 5. Link Structure (Max 10) ---
  let linkScore = 0;
  // Parse Links
  const linkMatches = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi));
  const urls = linkMatches.map(m => m[1]);
  
  let internalLinks = 0;
  let externalLinks = 0;

  urls.forEach(url => {
      const u = url.trim();
      const isRelative = u.startsWith('/') || u.startsWith('#');
      const isDomainMatch = targetDomain && u.toLowerCase().includes(targetDomain.toLowerCase());
      
      if (isRelative || isDomainMatch) {
          internalLinks++;
      } else if (u.startsWith('http')) {
          externalLinks++;
      }
  });

  if (internalLinks > 0) linkScore += 5;
  if (externalLinks > 0) linkScore += 5;

  const linkStats: LinkStats = {
    internal: internalLinks,
    external: externalLinks,
    broken: brokenLinks, // Passed in
    unchecked: [] 
  };

  // --- Scoring & Penalties ---
  let totalScore = metaScore + headingScore + keywordScore + contentScore + linkScore;
  
  // Penalties
  if (h1Count === 0) { warnings.push("Missing H1 title tag."); totalScore -= 10; }
  if (h1Count > 1) { warnings.push("Multiple H1 tags detected."); totalScore -= 5; }
  if (density > 3.0) { warnings.push("Keyword stuffing detected."); totalScore -= 5; }
  
  // Broken Link Penalty
  if (brokenLinks.length > 0) {
    const deduction = brokenLinks.length * 5;
    totalScore -= deduction;
    warnings.push(`${brokenLinks.length} broken links detected.`);
  }

  totalScore = Math.max(0, Math.min(100, totalScore));

  const scoreBreakdown: ScoreBreakdown = {
    meta: metaScore,
    heading: headingScore,
    keyword: keywordScore,
    content: contentScore,
    link: linkScore
  };

  // Prominence Score (Legacy/UI compatibility)
  if (primaryK) {
     const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
     const hasInH1 = h1Match ? h1Match[1].toLowerCase().includes(primaryK) : false;
     if (hasInH1) prominenceScore += 20;
     if (first100Words.includes(primaryK)) prominenceScore += 20;
     if (metaTitle.toLowerCase().includes(primaryK)) prominenceScore += 20;
     if (metaDescription.toLowerCase().includes(primaryK)) prominenceScore += 20;
     const hasInH2 = (html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []).some((h: string) => h.toLowerCase().includes(primaryK));
     if (hasInH2) prominenceScore += 20;
  }

  // Populate Checklist (subset)
  checklist.push({ label: 'Title length optimized', passed: titleLen >= 50 && titleLen <= 60, impact: 'critical' });
  checklist.push({ label: 'Primary keyword in title', passed: !!(primaryK && titleHasKey), impact: 'critical' });
  checklist.push({ label: 'Content length > 600 words', passed: wordCount > 600, impact: 'moderate' });
  checklist.push({ label: 'Internal links present', passed: internalLinks > 0, impact: 'moderate' });
  
  let status: SEOHealth['status'] = 'excellent';
  if (totalScore < 50) status = 'poor';
  else if (totalScore < 70) status = 'fair';
  else if (totalScore < 85) status = 'good';

  return { score: totalScore, warnings, status, checklist, prominenceScore, linkStats, scoreBreakdown };
};
