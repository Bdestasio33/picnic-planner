import type { UserPreferences } from '../types/custom/preferences';
import type { WeatherForecastDto, WeatherConditionType } from '../types';

/**
 * Calculate weather condition based on user preferences
 */
export const calculateCondition = (
  forecast: WeatherForecastDto,
  preferences: UserPreferences
): WeatherConditionType => {
  if (!forecast) return 'unknown';

  const reasons: string[] = [];
  let score = 100;
  let hasPoorCondition = false;

  // Temperature check
  const avgTemp = forecast.maxTemperature && forecast.minTemperature 
    ? (forecast.maxTemperature + forecast.minTemperature) / 2 
    : forecast.maxTemperature || forecast.minTemperature || 20;

  if (avgTemp >= preferences.temperature.ideal.min && avgTemp <= preferences.temperature.ideal.max) {
    reasons.push('Ideal temperature');
  } else if (avgTemp < preferences.temperature.poor.min || avgTemp > preferences.temperature.poor.max) {
    reasons.push('Poor temperature');
    score -= 30;
    hasPoorCondition = true;
  } else {
    reasons.push('Fair temperature');
    score -= 10; // Reduced from 15 to be less harsh
  }

  // Precipitation chance check
  const precipChance = forecast.precipitationChance || 0;
  if (precipChance <= preferences.precipitation.ideal.chanceMax) {
    reasons.push('Low rain chance');
  } else if (precipChance >= preferences.precipitation.poor.chanceMin) {
    reasons.push('High rain chance');
    score -= 25;
    hasPoorCondition = true;
  } else {
    reasons.push('Moderate rain chance');
    score -= 8; // Reduced from 12 to be less harsh
  }

  // Precipitation amount check
  const precipAmount = forecast.precipitationAmount || 0;
  if (precipAmount <= preferences.precipitation.ideal.amountMax) {
    reasons.push('Minimal precipitation');
  } else if (precipAmount >= preferences.precipitation.poor.amountMin) {
    reasons.push('Heavy precipitation');
    score -= 20;
    hasPoorCondition = true;
  } else {
    reasons.push('Light precipitation');
    score -= 6; // Reduced from 10 to be less harsh
  }

  // Wind speed check
  const windSpeed = forecast.windSpeed || 0;
  if (windSpeed <= preferences.wind.ideal.max) {
    reasons.push('Light wind');
  } else if (windSpeed >= preferences.wind.poor.min) {
    reasons.push('Strong wind');
    score -= 15;
    hasPoorCondition = true;
  } else {
    reasons.push('Moderate wind');
    score -= 5; // Reduced from 8 to be less harsh
  }

  // Humidity check
  const humidity = forecast.humidity || 50;
  if (humidity >= preferences.humidity.ideal.min && humidity <= preferences.humidity.ideal.max) {
    reasons.push('Comfortable humidity');
  } else if (humidity < preferences.humidity.poor.min || humidity > preferences.humidity.poor.max) {
    reasons.push('Poor humidity');
    score -= 10;
    hasPoorCondition = true;
  } else {
    reasons.push('Fair humidity');
    score -= 3; // Reduced from 5 to be less harsh
  }

  // Determine condition based on poor conditions and score
  if (hasPoorCondition) return 'poor';
  if (score >= 85) return 'ideal';
  if (score >= 60) return 'fair'; // This threshold remains the same
  return 'poor';
};

/**
 * Calculate detailed weather condition with reasons and score
 */
export const calculateDetailedCondition = (
  forecast: WeatherForecastDto,
  preferences: UserPreferences
) => {
  const type = calculateCondition(forecast, preferences);
  const reasons: string[] = [];
  let score = 100;
  let hasPoorCondition = false;

  if (!forecast) {
    return {
      type: 'unknown',
      description: 'No weather data available',
      score: 0,
      reasons: ['No data']
    };
  }

  // Calculate detailed reasons and score (same logic as above but with detailed tracking)
  const avgTemp = forecast.maxTemperature && forecast.minTemperature 
    ? (forecast.maxTemperature + forecast.minTemperature) / 2 
    : forecast.maxTemperature || forecast.minTemperature || 20;

  if (avgTemp >= preferences.temperature.ideal.min && avgTemp <= preferences.temperature.ideal.max) {
    reasons.push(`Ideal temperature (${Math.round(avgTemp)}°C)`);
  } else if (avgTemp < preferences.temperature.poor.min || avgTemp > preferences.temperature.poor.max) {
    reasons.push(`Poor temperature (${Math.round(avgTemp)}°C)`);
    score -= 30;
    hasPoorCondition = true;
  } else {
    reasons.push(`Fair temperature (${Math.round(avgTemp)}°C)`);
    score -= 10; // Reduced from 15 to be less harsh
  }

  const precipChance = forecast.precipitationChance || 0;
  if (precipChance <= preferences.precipitation.ideal.chanceMax) {
    reasons.push(`Low rain chance (${precipChance}%)`);
  } else if (precipChance >= preferences.precipitation.poor.chanceMin) {
    reasons.push(`High rain chance (${precipChance}%)`);
    score -= 25;
    hasPoorCondition = true;
  } else {
    reasons.push(`Moderate rain chance (${precipChance}%)`);
    score -= 8; // Reduced from 12 to be less harsh
  }

  const precipAmount = forecast.precipitationAmount || 0;
  if (precipAmount > 0) {
    if (precipAmount <= preferences.precipitation.ideal.amountMax) {
      reasons.push(`Light rain (${precipAmount}mm)`);
    } else if (precipAmount >= preferences.precipitation.poor.amountMin) {
      reasons.push(`Heavy rain (${precipAmount}mm)`);
      score -= 20;
      hasPoorCondition = true;
    } else {
      reasons.push(`Moderate rain (${precipAmount}mm)`);
      score -= 6; // Reduced from 10 to be less harsh
    }
  }

  const windSpeed = forecast.windSpeed || 0;
  if (windSpeed <= preferences.wind.ideal.max) {
    reasons.push(`Light breeze (${Math.round(windSpeed)} km/h)`);
  } else if (windSpeed >= preferences.wind.poor.min) {
    reasons.push(`Strong wind (${Math.round(windSpeed)} km/h)`);
    score -= 15;
    hasPoorCondition = true;
  } else {
    reasons.push(`Moderate wind (${Math.round(windSpeed)} km/h)`);
    score -= 5; // Reduced from 8 to be less harsh
  }

  const humidity = forecast.humidity || 50;
  if (humidity >= preferences.humidity.ideal.min && humidity <= preferences.humidity.ideal.max) {
    reasons.push(`Comfortable humidity (${humidity}%)`);
  } else if (humidity < preferences.humidity.poor.min || humidity > preferences.humidity.poor.max) {
    reasons.push(`Uncomfortable humidity (${humidity}%)`);
    score -= 10;
    hasPoorCondition = true;
  } else {
    reasons.push(`Fair humidity (${humidity}%)`);
    score -= 3; // Reduced from 5 to be less harsh
  }

  // Create description
  const descriptions = {
    ideal: 'Perfect conditions for a picnic!',
    fair: 'Good conditions with minor concerns',
    poor: 'Challenging conditions for outdoor activities',
    unknown: 'Weather data unavailable'
  };

  return {
    type,
    description: descriptions[type],
    score: Math.max(0, score),
    reasons
  };
}; 