import { useState, useEffect } from 'react';
import { getAppearance } from './settings';

export const translations = {
  Hindi: {
    "Dashboard": "डैशबोर्ड",
    "Attendance": "उपस्थिति",
    "Academics": "शैक्षणिक",
    "Fees": "फीस",
    "Messages": "संदेश",
    "Transport": "परिवहन",
    "Settings": "सेटिंग्स",
    "Sign out": "साइन आउट",
    "Appearance": "सजावट / प्रकटन",
    "Theme": "थीम",
    "Display Density": "प्रदर्शन घनत्व",
    "Language": "भाषा",
    "Save Changes": "बदलाव सहेजें",
    "Saved successfully!": "सफलतापूर्वक सहेजा गया!",
    "Light": "प्रकाश",
    "Dark": "अंधेरा",
    "System": "सिस्टम",
    "Compact": "संक्षिप्त",
    "Comfortable": "आरामदायक",
    "Spacious": "विशाल",
    "Profile": "प्रोफ़ाइल",
    "Security": "सुरक्षा",
    "Notifications": "सूचनाएं"
  },
  Marathi: {
    "Dashboard": "डॅशबोर्ड",
    "Attendance": "हजेरी",
    "Academics": "शैक्षणिक",
    "Fees": "फी / शुल्क",
    "Messages": "संदेश",
    "Transport": "वाहतूक",
    "Settings": "सेटिंग्ज",
    "Sign out": "बाहेर पडा",
    "Appearance": "दिसणे / रूप",
    "Theme": "थीम",
    "Display Density": "प्रदर्शन घनता",
    "Language": "भाषा",
    "Save Changes": "बदल जतन करा",
    "Saved successfully!": "यशस्वीरित्या जतन केले!",
    "Light": "प्रकाश",
    "Dark": "गडद",
    "System": "सिस्टम",
    "Compact": "संक्षिप्त",
    "Comfortable": "आरामदायक",
    "Spacious": "प्रशस्त",
    "Profile": "प्रोफाईल",
    "Security": "सुरक्षा",
    "Notifications": "सूचना"
  },
  Gujarati: {
    "Dashboard": "ડેશબોર્ડ",
    "Attendance": "હાજરી",
    "Academics": "શૈક્ષણિક",
    "Fees": "ફી",
    "Messages": "સંદેશાઓ",
    "Transport": "પરિવહન",
    "Settings": "સેટિંગ્સ",
    "Sign out": "સાઇન આઉટ",
    "Appearance": "દેખાવ",
    "Theme": "થીમ",
    "Display Density": "ડિસ્પ્લે ઘનતા",
    "Language": "ભાષા",
    "Save Changes": "ફેરફારો સાચવો",
    "Saved successfully!": "સફળતાપૂર્વક સાચવવામાં આવ્યું!",
    "Light": "પ્રકાશ",
    "Dark": "અંધકાર",
    "System": "સિસ્ટમ",
    "Compact": "કૉમ્પેક્ટ",
    "Comfortable": "આરામદાયક",
    "Spacious": "વિશાળ",
    "Profile": "પ્રોફાઇલ",
    "Security": "સુરક્ષા",
    "Notifications": "સૂચનાઓ"
  },
  Tamil: {
    "Dashboard": "டாஷ்போர்டு",
    "Attendance": "வருகை",
    "Academics": "கல்வி",
    "Fees": "கட்டணம்",
    "Messages": "செய்திகள்",
    "Transport": "போக்குவரத்து",
    "Settings": "அமைப்புகள்",
    "Sign out": "வெளியேறு",
    "Appearance": "தோற்றம்",
    "Theme": "தீம்",
    "Display Density": "காட்சி அடர்த்தி",
    "Language": "மொழி",
    "Save Changes": "மாற்றங்களைச் சேமி",
    "Saved successfully!": "வெற்றிகரமாக சேமிக்கப்பட்டது!",
    "Light": "ஒளி",
    "Dark": "இருள்",
    "System": "கணினி",
    "Compact": "சிறிய",
    "Comfortable": "வசதியான",
    "Spacious": "பரந்த",
    "Profile": "சுயவிவரம்",
    "Security": "பாதுகாப்பு",
    "Notifications": "அறிவிப்புகள்"
  },
  Telugu: {
    "Dashboard": "డాష్‌బోర్డ్",
    "Attendance": "హాజరు",
    "Academics": "విద్యా విషయాలు",
    "Fees": "ఫీజులు",
    "Messages": "సందేశాలు",
    "Transport": "రవాణా",
    "Settings": "సెట్టింగులు",
    "Sign out": "సైన్ అవుట్",
    "Appearance": "రూపం",
    "Theme": "థీమ్",
    "Display Density": "ప్రదర్శన సాంద్రత",
    "Language": "భాష",
    "Save Changes": "మార్పులను సేవ్ చేయి",
    "Saved successfully!": "విజయవంతంగా సేవ్ చేయబడింది!",
    "Light": "కాంతి",
    "Dark": "చీకటి",
    "System": "సిస్టమ్",
    "Compact": "సరిపోవు",
    "Comfortable": "సౌకర్యవంతమైన",
    "Spacious": "విశాలమైన",
    "Profile": "ప్రొఫైల్",
    "Security": "భద్రత",
    "Notifications": "నోటిఫికేషన్లు"
  }
};

export function getLanguage() {
  return getAppearance().language || 'English';
}

export function useLanguage() {
  const [lang, setLang] = useState(getLanguage());

  useEffect(() => {
    const handleUpdate = () => {
      setLang(getLanguage());
    };
    window.addEventListener('appearance-changed', handleUpdate);
    return () => window.removeEventListener('appearance-changed', handleUpdate);
  }, []);

  return lang;
}

export function t(key, lang) {
  if (lang === 'English') return key;
  return translations[lang]?.[key] || key;
}
