/**
 * useHarvestMetrics - Calculate CRM metrics for Harvest screen
 * 
 * Provides:
 * - Active volitions count
 * - Weekly time investment
 * - Internal work completion percentage
 */

import { useMemo } from 'react';
import { calculateWeeklyTime, calculateInternalWork, type VolitionInstance } from '@/services/volitionManager';

interface HarvestMetricsData {
  // Volition data
  activeVolitions: VolitionInstance[];
  
  // Contact data for internal work calculation
  totalContacts: number;
  contactsWithRanking: number;
  contactsWithEnrichedData: number;
  
  // Interaction data
  totalInteractions: number;
  interactionsRated: number;
  
  // Layer data
  layersReviewed: number;
  totalLayers: number;
}

export interface HarvestMetrics {
  activeVolitionsCount: number;
  weeklyTimeHours: number;
  internalWorkPercent: number;
  internalWorkBreakdown: {
    ranking: number;
    ratings: number;
    enrichment: number;
    review: number;
  };
}

/**
 * Calculate all Harvest metrics from raw data
 */
export function useHarvestMetrics(data: HarvestMetricsData): HarvestMetrics {
  return useMemo(() => {
    // Count active volitions
    const activeVolitionsCount = data.activeVolitions.filter(
      v => v.isActive && !v.pausedAt
    ).length;
    
    // Calculate weekly time in hours
    const weeklyMinutes = calculateWeeklyTime(data.activeVolitions);
    const weeklyTimeHours = weeklyMinutes / 60;
    
    // Calculate internal work percentage
    const internalWork = calculateInternalWork({
      totalContacts: data.totalContacts,
      contactsWithRanking: data.contactsWithRanking,
      totalInteractions: data.totalInteractions,
      interactionsRated: data.interactionsRated,
      contactsWithEnrichedData: data.contactsWithEnrichedData,
      layersReviewed: data.layersReviewed,
      totalLayers: data.totalLayers,
    });
    
    return {
      activeVolitionsCount,
      weeklyTimeHours,
      internalWorkPercent: internalWork.overallPercentage,
      internalWorkBreakdown: {
        ranking: internalWork.rankingCompleteness,
        ratings: internalWork.interactionRatings,
        enrichment: internalWork.dataEnrichment,
        review: internalWork.reviewCompletion,
      },
    };
  }, [data]);
}

/**
 * Mock/default metrics when no data is available
 */
export function getMockMetrics(): HarvestMetrics {
  return {
    activeVolitionsCount: 0,
    weeklyTimeHours: 0,
    internalWorkPercent: 0,
    internalWorkBreakdown: {
      ranking: 0,
      ratings: 0,
      enrichment: 0,
      review: 0,
    },
  };
}
