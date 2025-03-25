import moment from 'moment';
import loadTranslations from './translation-helper.js';

const timeDiff = (date, lang = 'en') => {
  const now = moment();
  const then = moment(date);
  const diff = now.diff(then);

  // Load translations for the specified language
  const translations = loadTranslations(lang);
  const timeTranslations = translations?.time;

  // Set moment locale based on language
  moment.locale(lang);

  if (diff < 60000) { // less than 1 minute
    return timeTranslations.just_now;
  }

  if (diff < 3600000) { // less than 1 hour
    const minutes = Math.floor(diff / 60000);
    const unit = minutes > 1 ? timeTranslations.minutes : timeTranslations.minute;
    return `${minutes} ${unit} ${timeTranslations.ago}`;
  }

  if (diff < 86400000) { // less than 1 day
    const hours = Math.floor(diff / 3600000);
    const unit = hours > 1 ? timeTranslations.hours : timeTranslations.hour;
    return `${hours} ${unit} ${timeTranslations.ago}`;
  }

  if (diff < 2592000000) { // less than 30 days
    const days = Math.floor(diff / 86400000);
    const unit = days > 1 ? timeTranslations.days : timeTranslations.day;
    return `${days} ${unit} ${timeTranslations.ago}`;
  }

  // After 30 days, return formatted date
  return then.format(timeTranslations.date_format);
};

export default timeDiff;
