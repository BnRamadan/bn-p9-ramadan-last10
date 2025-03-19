import React, { useState, useEffect } from 'react';
import { Award, Gift, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Challenge {
  id: number;
  title: string;
  description: string;
  category: 'prayer' | 'quran' | 'charity' | 'dhikr';
  difficulty: 'سهل' | 'متوسط' | 'متقدم' | 'ليلة القدر';
  points: number;
  isQadrNight?: boolean;
  isCustom?: boolean; // إضافة خاصية للتحديات المخصصة
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: JSX.Element;
  condition: (completedChallenges: number[], totalPoints: number) => boolean;
  points: number;
}

const quranDuas = [
  {
    id: 1,
    text: ' رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ العَلِيمُ، وَتُبْ عَلَيْنَا إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ',
  },
  {
    id: 2,
    text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  },
  {
    id: 3,
    text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى القَوْمِ الكَافِرِينَ',
  },
  {
    id: 4,
    text: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا، رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا',
  },
  {
    id: 5,
    text: 'رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا، أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى القَوْمِ الكَافِرِينَ',
  },
  {
    id: 6,
    text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً، إِنَّكَ أَنتَ الوَهَّابُ',
  },
  {
    id: 7,
    text: 'رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِيَوْمٍ لَّا رَيْبَ فِيهِ، إِنَّ اللَّهَ لَا يُخْلِفُ المِيعَادَ',
  },
  {
    id: 8,
    text: 'رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ',
  },
  {
    id: 9,
    text: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً، إِنَّكَ سَمِيعُ الدُّعَاءِ',
  },
  {
    id: 10,
    text: 'رَبَّنَا آمَنَّا بِمَا أَنزَلْتَ وَاتَّبَعْنَا الرَّسُولَ فَاكْتُبْنَا مَعَ الشَّاهِدِينَ',
  },
  {
    id: 11,
    text: 'رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى القَوْمِ الكَافِرِينَ',
  },
  {
    id: 12,
    text: 'رَبَّنَا مَا خَلَقْتَ هَذَا بَاطِلًا، سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ',
  },
  {
    id: 13,
    text: 'رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ، وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ',
  },
  {
    id: 14,
    text: 'رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا، رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الأَبْرَارِ',
  },
  {
    id: 15,
    text: 'رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَى رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ القِيَامَةِ، إِنَّكَ لَا تُخْلِفُ المِيعَادَ',
  },
  {
    id: 16,
    text: 'رَبَّنَا أَخْرِجْنَا مِنْ هَذِهِ القَرْيَةِ الظَّالِمِ أَهْلُهَا، وَاجْعَلْ لَنَا مِن لَّدُنكَ وَلِيًّا وَاجْعَلْ لَنَا مِن لَّدُنكَ نَصِيرًا',
  },
  {
    id: 17,
    text: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا، وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الخَاسِرِينَ',
  },
  {
    id: 18,
    text: 'رَبَّنَا افْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِالحَقِّ، وَأَنتَ خَيْرُ الفَاتِحِينَ',
  },
  {
    id: 19,
    text: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
  },
  {
    id: 20,
    text: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ، وَنَجِّنَا بِرَحْمَتِكَ مِنَ القَوْمِ الكَافِرِينَ',
  },
  {
    id: 21,
    text: 'رَبِّ إِنِّي أَعُوذُ بِكَ أَنْ أَسْأَلَكَ مَا لَيْسَ لِي بِهِ عِلْمٌ، وَإِلَّا تَغْفِرْ لِي وَتَرْحَمْنِي أَكُن مِّنَ الخَاسِرِينَ',
  },
  {
    id: 22,
    text: 'رَبِّ أَنتَ وَلِيِّي فِي الدُّنْيَا وَالآخِرَةِ، تَوَفَّنِي مُسْلِمًا وَأَلْحِقْنِي بِالصَّالِحِينَ',
  },
  {
    id: 23,
    text: 'رَبَّنَا إِنَّكَ تَعْلَمُ مَا نُخْفِي وَمَا نُعْلِنُ، وَمَا يَخْفَى عَلَى اللَّهِ مِنْ شَيْءٍ فِي الأَرْضِ وَلَا فِي السَّمَاءِ',
  },
  {
    id: 24,
    text: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي، رَبَّنَا وَتَقَبَّلْ دُعَاءِ، رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الحِسَابُ',
  },
  {
    id: 25,
    text: 'رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ، وَاجْعَلْ لِي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا',
  },
  {
    id: 26,
    text: 'رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً، وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
  },
  {
    id: 27,
    text: 'رَبِّ اشْرَحْ لِي صَدْرِي، وَيَسِّرْ لِي أَمْرِي، وَاحْلُلْ عُقْدَةً مِن لِسَانِي، يَفْقَهُوا قَوْلِي',
  },
  {
    id: 28,
    text: 'لَا إِلَهَ إِلَّا أَنتَ، سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
  },
  {
    id: 29,
    text: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الوَارِثِينَ',
  },
  {
    id: 30,
    text: 'إِنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
  },
  {
    id: 31,
    text: 'رَبِّ أَنزِلْنِي مُنزَلًا مُّبَارَكًا، وَأَنتَ خَيْرُ المُنزِلِينَ',
  },
  {
    id: 32,
    text: 'رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ',
  },
  {
    id: 33,
    text: 'رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا وَأَنتَ خَيْرُ الرَّاحِمِينَ',
  },
  {
    id: 34,
    text: 'رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا، إِنَّهَا سَاءَتْ مُسْتَقَرًّا وَمُقَامًا',
  },
  {
    id: 35,
    text: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
  },
  {
    id: 36,
    text: 'رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ، وَاجْعَلْ لِي لِسَانَ صِدْقٍ فِي الْآخِرِينَ، وَاجْعَلْنِي مِنْ وَرَثَةِ جَنَّةِ النَّعِيمِ، وَلَا تُخْزِنِي يَوْمَ يُبْعَثُونَ، يَوْمَ لَا يَنفَعُ مَالٌ وَلَا بَنُونَ، إِلَّا مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ',
  },
  {
    id: 37,
    text: 'رَبِّ نَجِّنِي وَأَهْلِي مِمَّا يَعْمَلُونَ',
  },
  {
    id: 38,
    text: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَدْخِلْنِي بِرَحْمَتِكَ فِي عِبَادِكَ الصَّالِحِينَ',
  },
  {
    id: 39,
    text: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي، رَبِّ انْصُرْنِي عَلَى الْقَوْمِ الْمُفْسِدِينَ',
  },
  {
    id: 40,
    text: 'رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَحْمَةً وَعِلْمًا فَاغْفِرْ لِلَّذِينَ تَابُوا وَاتَّبَعُوا سَبِيلَكَ وَقِهِمْ عَذَابَ الْجَحِيمِ',
  },
  {
    id: 41,
    text: 'رَبَّنَا وَأَدْخِلْهُمْ جَنَّاتِ عَدْنٍ الَّتِي وَعَدْتَّهُمْ وَمَنْ صَلَحَ مِن آبَائِهِمْ وَأَزْوَاجِهِمْ وَذُرِّيَّاتِهِمْ، إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ، وَقِهِمُ السَّيِّئَاتِ، وَمَن تَقِ السَّيِّئَاتِ يَوْمَئِذٍ فَقَدْ رَحِمْتَهُ، وَذَٰلِكَ هُوَ الْفَوْزُ الْعَظِيمُ',
  },
  {
    id: 42,
    text: 'رَبَّنَا اكْشِفْ عَنَّا الْعَذَابَ إِنَّا مُؤْمِنُونَ',
  },
  {
    id: 43,
    text: ' أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَىٰ وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي، إِنِّي تُبْتُ إِلَيْكَ وَإِنِّي مِنَ الْمُسْلِمِينَ',
  },
  {
    id: 44,
    text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِلَّذِينَ آمَنُوا',
  },
  {
    id: 45,
    text: 'رَبَّنَا إِنَّكَ رَءُوفٌ رَحِيمٌ، رَبَّنَا عَلَيْكَ تَوَكَّلْنَا وَإِلَيْكَ أَنَبْنَا وَإِلَيْكَ الْمَصِيرُ، رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلَّذِينَ كَفَرُوا وَاغْفِرْ لَنَا، رَبَّنَا إِنَّكَ أَنتَ الْعَزِيزُ الْحَكِيمُ',
  },
  {
    id: 46,
    text: 'رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا، إِنَّكَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ ابْنِ لِي عِندَكَ بَيْتًا فِي الْجَنَّةِ وَنَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ',
  },
  {
    id: 47,
    text: 'رَبِّ لَا تَذَرْ عَلَى الْأَرْضِ مِنَ الْكَافِرِينَ دَيَّارًا، إِنَّكَ إِن تَذَرْهُمْ يُضِلُّوا عِبَادَكَ وَلَا يَلِدُوا إِلَّا فَاجِرًا كَفَّارًا',
  },
  {
    id: 48,
    text: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ وَلَا تَزِدِ الظَّالِمِينَ إِلَّا تَبَارًا',
  },
];

const wasaya = [
  {
    id: 1,
    text: '•• الوصية الأولى💜\nصلي كل ليلة قيام الليل ولو ركعتين بمائة آية؛\nفإن وافقت صلاتك ليلة القدر كتب عند الله تعالى من القانتين يوميا لمدة 84 سنة! لقول النبي صلى الله عليه وسلم: (من قام بمائة آية كتب من القانتين، ومن قام بألف آية كتب من المقنطرين) صححه الألباني',
  },
  {
    id: 2,
    text: '•• الوصية الثانية💜\nاقرأ كل ليلة (سورة الإخلاص) 3 مرات؛ فإن وافقت قراءتك ليلة القدر كنت كمن قرأ القرآن الكريم كاملا يوميا لمدة 84 سنة، لقول النبي صلى الله عليه وسلم: (أَيَعْجِزُ أَحَدُكُمْ أَنْ يَقْرَأَ فِي لَيْلَةٍ ثُلُثَ الْقُرْآنِ ؟ قَالُوا : وَكَيْفَ يَقْرَأْ ثُلُثَ الْقُرْآنِ، قَالَ : قُلْ هُوَ اللَّهُ أَحَدٌ تَعْدِلُ ثُلُثَ الْقُرْآنِ) صحيح مسلم',
  },
  {
    id: 3,
    text: '•• الوصية الثالثة💜\nقراءة خواتيم سورة البقرة (لله ما في السماوات وما في الأرض..) فإن وافقت ليلة القدر؛ فقد كتب لك قيام 30000 ثلاثين ألف ليلة، لقول النبي صلى الله عليه وسلم: ( من قرأ هاتين الآيتين من آخر سورة البقرة في ليلة كفتاه)*رواه مسلم، وقال ابن حجر: *كفتاه: يعني: أجزأتاه عن قيام الليل، وقيل: غير ذلك',
  },
  {
    id: 4,
    text: '•• الوصية الرابعة💜\nتصدق كل ليلة ولو بصدقة واحدة فإن وافقت ليلة القدر كنت كمن تصدق يوميا لمدة 84 سنة!',
  },
  {
    id: 5,
    text: '•• الوصية الخامسة💜\nاحرص على هذا الذكر: (لا إله إلا الله وحده لا شريك له له الملك وله الحمد وهو على كل شيء قدير) 100مرة\nفإن وافقت ليلة القدر كنت كمن أعتق 300000 ألف رقبة، والرقبة الواحدة تعتق من النار، لقول النبي صلى الله عليه وسلم في الحديث الصحيح: *(أَيُّمَا امْرِئٍ مُسْلِمٍ أَعْتَقَ امْرَأً مُسْلِمًا، اسْتَنْقَذَ اللَّهُ بِكُلِّ عُضْوٍ مِنْهُ عُضْوًا مِنْهُ مِنَ النَّارِ) \nمُتَّفَقٌ عَلَيْهِ',
  },
  {
    id: 6,
    text: '•• الوصية السادسة💜\nقل: (لا إله إلا الله وحده لا شريك له، الله أكبر كبيرا، والحمد لله كثيرا، سبحان الله رب العالمين، لا حول ولا قوة إلا بالله العزيز الحكيم) ثم قل: (اللهم اغفر لي، وارحمني، واهدني، وارزقني) فإن وافقت ليلة القدر؛ فقد ملأت يدك من الخير لمدة 30000 ثلاثون ألف يوما.',
  },
  {
    id: 7,
    text: '•• الوصية السابعة💜\nقل: (اللهم اغفر للمؤمنين والمؤمنات) \nفإن وافقت ليلة القدر؛ فقد كتب لك *60000000000000 ستين بليون حسنة؛ لقول النبي صلى الله عليه وسلم:\n (من استغفر للمؤمنين والمؤمنات كتب الله له بكل مؤمن ومؤمنة حسنة) \nحسّنه الألباني',
  },
  {
    id: 8,
    text: '•• الوصية الثامنة💜\nقل: (سبحان الله) 100مرة\n فإن وافقت ليلة القدر يكتب لك 30,000,000 ثلاثين مليون حسنة، أو تحط عنك ثلاثين مليون خطيئة؛\nلقول النبي صلى الله عليه وسلم:\n (أيعجز أحدكم أن يكسب كل يوم ألف حسنة، فسأله سائل من جلسائه: كيف يكسب أحدنا ألف حسنة؟ قال: يسبح مائة تسبيحة، فيكتب له ألف حسنة أو يحط عنه ألف خطيئة) رواه مسلم',
  },
  {
    id: 9,
    text: '•• الوصية التاسعة💜\nاحرص على قول : (سبحان الله العظيم وبحمده) 100مرة\n فإن وافقت ليلة القدر يكتب لك 3,000,000 ثلاثة ملايين نخلة في الجنة، لقول النبي صلى الله عليه وسلم: \n(من قال سبحان الله العظيم وبحمده غرست له نخلة في الجنة)\n صححه الألباني',
  },
  {
    id: 10,
    text: '•• الوصية العاشرة💜\nقل: (اللهم صل على محمد وآل محمد) 100مرة\n فإن وافقت ليلة القدر يكتب لك 3,000,000 ثلاثة ملايين رحمة من ملك الملوك ، لقول النبي صلى الله عليه وسلم: \n(مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى الله عَلَيْهِ عَشْرًا)*رواه مسلم؛ وقال الشوكاني: *المراد بالصلاة من الله الرحمة لعباده، وأنه يرحمهم رحمة بعد رحمة؛ حتى تبلغ رحمته ذلك العدد',
  },
  {
    id: 11,
    text: '•• الوصية الحادية عشر💜\nقل: (سبحان اللهِ عدَدَ ما خلق... والحمد للهِ مِلْءَ كلِّ شيءٍ)\n *فإن وافقت ليلة القدر؛ كان أفضل من ذكرك الليل مع النهار لمدة 30000 ثلاثون ألف يوما.',
  },
  {
    id: 12,
    text: '•• الوصية الثانية عشر💜\nقول: لا حول ولا قوة إلا بالله 100 مرة؛ فإن وافقت ليلة القدر يكتب لك 3,000,000 ثلاثة ملايين كنز في الجنة.',
  },
];

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'صلاة قيام الليل',
    description: 'صلِّ 8 ركعات من قيام الليل بعد صلاة العشاء وقبل الفجر',
    category: 'prayer',
    difficulty: 'سهل',
    points: 50,
  },
  {
    id: 2,
    title: 'قراءة سورة الكهف',
    description: 'اقرأ سورة الكهف كاملة اليوم',
    category: 'quran',
    difficulty: 'متوسط',
    points: 75,
  },
  {
    id: 3,
    title: 'تصدق على محتاج',
    description: 'قم بالتصدق ولو بمبلغ بسيط على أحد المحتاجين',
    category: 'charity',
    difficulty: 'سهل',
    points: 50,
  },
  {
    id: 4,
    title: 'دعاء ليلة القدر',
    description: 'اللهم إنك عفو تحب العفو فاعف عني',
    category: 'dhikr',
    difficulty: 'ليلة القدر',
    points: 100,
    isQadrNight: true,
  },
  {
    id: 5,
    title: 'صلاة الضحى',
    description: 'صلِّ صلاة الضحى من 2-8 ركعات من بعد شروق الشمس بربع ساعة حتى قبل الظهر',
    category: 'prayer',
    difficulty: 'متوسط',
    points: 75,
  },
  {
    id: 6,
    title: 'تلاوة 5 صفحات من القرآن',
    description: 'تلاوة 5 صفحات من القرآن بتدبر',
    category: 'quran',
    difficulty: 'سهل',
    points: 50,
  },
  {
    id: 7,
    title: 'الاستغفار 100 مرة',
    description: 'قل "استغفر الله العظيم" 100 مرة',
    category: 'dhikr',
    difficulty: 'سهل',
    points: 50,
  },
  {
    id: 8,
    title: 'إطعام مسكين',
    description: 'قم بإطعام مسكين أو المساهمة في إفطار صائم',
    category: 'charity',
    difficulty: 'متوسط',
    points: 75,
  },
  {
    id: 9,
    title: 'حفظ آية من القرآن',
    description: 'حفظ آية جديدة من القرآن الكريم',
    category: 'quran',
    difficulty: 'متقدم',
    points: 100,
  },
  {
    id: 10,
    title: 'الصلاة على النبي ﷺ',
    description: 'صلِّ على النبي محمد ﷺ 100 مرة',
    category: 'dhikr',
    difficulty: 'سهل',
    points: 50,
  },
];

const achievements: Achievement[] = [
  {
    id: 1,
    title: 'بداية مباركة',
    description: 'أكمل أول تحدي',
    icon: <Star className="w-6 h-6" />,
    condition: (completed) => completed.length >= 1,
    points: 100,
  },
  {
    id: 2,
    title: 'المجتهد',
    description: 'أكمل 5 تحديات',
    icon: <Award className="w-6 h-6" />,
    condition: (completed) => completed.length >= 5,
    points: 250,
  },
  {
    id: 3,
    title: 'المثابر',
    description: 'أكمل جميع التحديات',
    icon: <Gift className="w-6 h-6" />,
    condition: (completed) => completed.length >= 10,
    points: 500,
  },
];

const dailyDuas = [
  'اللهم إني أسألك الجنة وما قرب إليها من قول وعمل، وأعوذ بك من النار وما قرب إليها من قول وعمل',
  'اللهم إنك عفو تحب العفو فاعف عني',
  'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار',
];

const dailyTips = [
  'حاول أن تكثر من قراءة القرآن وختمه في هذه الأيام المباركة، فإن للقرآن شفاعة يوم القيامة.',
  'اجتهد في قيام الليل، فإنه من أفضل العبادات في العشر الأواخر.',
  'أكثر من الدعاء في السجود، فإنه أقرب ما يكون العبد من ربه وهو ساجد.',
];

const qadrNightInfo = [
  {
    title: 'علامات ليلة القدر',
    points: [
      'أن يكون الجو معتدلا والريح ساكنة - فعن ابن عباس قال - قال رسول الله صلى الله عليه وسلم - ليلة القدر ليلة سمحة، طلقة، لا حارة ولا باردة، تصبح الشمس صبيحتها ضعيفة حمراء',
      'قوة الإضاءة والنور في تلك الليلة',
      'طمأنينة القلب',
      'انشراح الصدر من المسلم',
      'الرياح تكون فيها ساكنة',
    ],
  },
  {
    title: 'أفضل الأعمال فى العشر الاواخر',
    points: [
      'صلاة الفرائض الخمس بالمسجد',
      'صلاة السنن لان السنة في رمضان باجر فرض',
      'قيام الليل والتهجد',
      'قراءة القرآن وختمه',
      'إخراج صدقة كل يوم لعل يوم اخراجها يوافق ليلة القدر فتكون تصدقت لمدة ٨٤ عام',
      'الدعاء والذكر وخاصة لأهل غزة',
      'الاعتكاف في المسجد',
    ],
  },
];

const createCelebration = () => {
  const celebrationContainer = document.createElement('div');
  celebrationContainer.className = 'celebration-container';
  document.body.appendChild(celebrationContainer);

  // إنشاء مجموعة متنوعة من العناصر الاحتفالية
  for (let i = 0; i < 50; i++) {
    const item = document.createElement('div');
    item.className = 'celebration-item';

    // توزيع عشوائي للعناصر
    item.style.left = `${Math.random() * 100}%`;
    item.style.animationDelay = `${Math.random() * 2}s`;

    // ألوان متناسقة مع تصميم الموقع
    const colors = [
      'rgba(46, 74, 46, 0.8)', // الأخضر الداكن
      'rgba(255, 215, 0, 0.8)', // الذهبي
      'rgba(255, 255, 255, 0.8)', // الأبيض
      'rgba(46, 74, 46, 0.6)', // الأخضر الفاتح
      'rgba(255, 215, 0, 0.6)', // الذهبي الفاتح
    ];
    item.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // أحجام مختلفة للعناصر
    const size = Math.random() * 8 + 4;
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;

    celebrationContainer.appendChild(item);
  }

  // إزالة العناصر بعد انتهاء الحركة
  setTimeout(() => {
    celebrationContainer.remove();
  }, 3000);
};

function App() {
  const { width, height } = useWindowSize();
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentDua, setCurrentDua] = useState(dailyDuas[0]);
  const [currentTip, setCurrentTip] = useState(dailyTips[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [selectedDua, setSelectedDua] = useState(quranDuas[0]);
  const [selectedWasiya, setSelectedWasiya] = useState(wasaya[0]);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isRamadanEnded, setIsRamadanEnded] = useState(false);
  const [customChallenges, setCustomChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('customChallenges');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Partial<Challenge>>({
    category: 'prayer',
    difficulty: 'سهل',
    points: 50,
    isCustom: true,
  });

  // حفظ التحديات المخصصة في localStorage
  useEffect(() => {
    localStorage.setItem('customChallenges', JSON.stringify(customChallenges));
  }, [customChallenges]);

  // دالة إضافة تحدي جديد
  const handleAddChallenge = () => {
    if (newChallenge.title && newChallenge.description) {
      const challenge: Challenge = {
        ...(newChallenge as Challenge),
        id: Date.now(),
        isCustom: true,
      };
      setCustomChallenges([...customChallenges, challenge]);
      setShowAddChallenge(false);
      setNewChallenge({
        category: 'prayer',
        difficulty: 'سهل',
        points: 50,
        isCustom: true,
      });
    }
  };

  // دالة حذف تحدي مخصص
  const handleDeleteChallenge = (challengeId: number) => {
    // التحقق مما إذا كان التحدي مكتملاً قبل حذفه
    const isCompleted = completedChallenges.includes(challengeId);
    const challenge = customChallenges.find((c) => c.id === challengeId);

    if (challenge) {
      // خصم النقاط إذا كان التحدي مكتملاً
      if (isCompleted) {
        setTotalPoints((prev) => Math.max(0, prev - challenge.points));
      }

      // حذف التحدي من القائمة المكتملة إذا كان موجوداً
      setCompletedChallenges((prev) => prev.filter((id) => id !== challengeId));

      // حذف التحدي من القائمة المخصصة
      setCustomChallenges((prev) => prev.filter((c) => c.id !== challengeId));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // إخفاء الناف بار عند التمرير لأسفل وإظهاره عند التمرير لأعلى
      if (currentScrollY > lastScrollY) {
        setIsNavHidden(true);
      } else {
        setIsNavHidden(false);
      }

      // إظهار زر العودة للأعلى عند التمرير لأسفل
      setShowScrollTop(currentScrollY > 300);

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('completedChallenges');
    const savedPoints = localStorage.getItem('totalPoints');
    const savedAchievements = localStorage.getItem('unlockedAchievements');
    const lastUpdateDate = localStorage.getItem('lastUpdateDate');
    const currentDate = new Date().toDateString();

    // التحقق مما إذا كان اليوم مختلفاً عن آخر تحديث
    if (lastUpdateDate !== currentDate) {
      // إعادة تعيين النقاط والتحديات
      setCompletedChallenges([]);
      setTotalPoints(0);
      localStorage.setItem('completedChallenges', JSON.stringify([]));
      localStorage.setItem('totalPoints', JSON.stringify(0));
      localStorage.setItem('lastUpdateDate', currentDate);
    } else {
      // تحميل البيانات المحفوظة
      if (savedProgress) {
        setCompletedChallenges(JSON.parse(savedProgress));
      }
      if (savedPoints) {
        setTotalPoints(JSON.parse(savedPoints));
      }
      if (savedAchievements) {
        setUnlockedAchievements(JSON.parse(savedAchievements));
      }
    }

    createStars();

    setCurrentDua(dailyDuas[Math.floor(Math.random() * dailyDuas.length)]);
    setCurrentTip(dailyTips[Math.floor(Math.random() * dailyTips.length)]);
  }, []);

  useEffect(() => {
    localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
    localStorage.setItem('totalPoints', JSON.stringify(totalPoints));
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    updateProgressBar();
    checkAchievements();
  }, [completedChallenges, totalPoints]);

  // تحديث النقاط عند تحميل التحديات المكتملة
  useEffect(() => {
    const calculateInitialPoints = () => {
      const allChallenges = [...challenges, ...customChallenges];
      const challengePoints = completedChallenges.reduce((total, challengeId) => {
        const challenge = allChallenges.find((c) => c.id === challengeId);
        return total + (challenge ? challenge.points : 0);
      }, 0);

      // حساب نقاط الإنجازات
      const achievementPoints = unlockedAchievements.reduce((total, achievementId) => {
        const achievement = achievements.find((a) => a.id === achievementId);
        return total + (achievement ? achievement.points : 0);
      }, 0);

      const totalPoints = challengePoints + achievementPoints;
      setTotalPoints(totalPoints);
      localStorage.setItem('totalPoints', JSON.stringify(totalPoints));
    };

    calculateInitialPoints();
  }, [completedChallenges, challenges, customChallenges, unlockedAchievements]);

  const createStars = () => {
    const starsContainer = document.getElementById('stars');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
      }
    }
  };

  const checkAchievements = () => {
    achievements.forEach((achievement) => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(completedChallenges, totalPoints)) {
        setUnlockedAchievements((prev) => [...prev, achievement.id]);
        setCurrentAchievement(achievement);
        setShowAchievement(true);

        // تحديث النقاط الإجمالية عند تحقيق الإنجاز
        setTotalPoints((prev) => {
          const newPoints = prev + achievement.points;
          // حفظ النقاط الجديدة في localStorage
          localStorage.setItem('totalPoints', JSON.stringify(newPoints));
          return newPoints;
        });

        setTimeout(() => setShowAchievement(false), 3000);
      }
    });
  };

  const updateProgressBar = () => {
    const progress = (completedChallenges.length / challenges.length) * 100;
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `أكملت ${completedChallenges.length} من ${challenges.length} تحديات`;
    }
  };

  const handleChallengeComplete = (challengeId: number) => {
    setCompletedChallenges((prev) => {
      const isCompleted = prev.includes(challengeId);
      const newCompleted = isCompleted ? prev.filter((id) => id !== challengeId) : [...prev, challengeId];

      // تحديث النقاط
      const challenge = [...challenges, ...customChallenges].find((c) => c.id === challengeId);
      if (challenge) {
        const pointsToAdd = isCompleted ? -challenge.points : challenge.points;
        setTotalPoints((prev) => Math.max(0, prev + pointsToAdd));
      }

      // إضافة تأثيرات الاحتفال عند إكمال التحدي
      if (!isCompleted) {
        setShowConfetti(true);
        createCelebration();
        setTimeout(() => setShowConfetti(false), 3000);
      }

      return newCompleted;
    });
  };

  const filteredChallenges = challenges.filter((challenge) => activeFilter === 'all' || challenge.category === activeFilter);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date('2025-03-19T23:59:59');
      const endDate = new Date('2025-03-29T23:59:59');

      if (now > endDate) {
        setIsRamadanEnded(true);
        setShowStats(true);
        return;
      }

      if (now < startDate) {
        const diff = startDate.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
      } else {
        const diff = endDate.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const convertToArabicNumbers = (num: number) => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num
      .toString()
      .split('')
      .map((x) => arabicNumbers[parseInt(x)])
      .join('');
  };

  const getStats = () => {
    const totalChallenges = challenges.length;
    const completedCount = completedChallenges.length;
    const completionRate = Math.round((completedCount / totalChallenges) * 100);
    const averagePointsPerDay = Math.round(totalPoints / 10);
    const categoryStats = {
      prayer: challenges.filter((c) => c.category === 'prayer' && completedChallenges.includes(c.id)).length,
      quran: challenges.filter((c) => c.category === 'quran' && completedChallenges.includes(c.id)).length,
      charity: challenges.filter((c) => c.category === 'charity' && completedChallenges.includes(c.id)).length,
      dhikr: challenges.filter((c) => c.category === 'dhikr' && completedChallenges.includes(c.id)).length,
    };

    return {
      totalChallenges,
      completedCount,
      completionRate,
      totalPoints,
      averagePointsPerDay,
      categoryStats,
    };
  };

  return (
    <div dir="rtl" className="min-h-screen">
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}

      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="achievement-popup">
            <div className="achievement-icon">{currentAchievement.icon}</div>
            <div className="achievement-content">
              <h3>{currentAchievement.title}</h3>
              <p>{currentAchievement.description}</p>
              <p className="achievement-points">+{currentAchievement.points} نقطة</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header>
        <div className="stars" id="stars"></div>
        <div className="container">
          <h1>العشر الأواخر من رمضان</h1>
          <p>أيام العتق والمغفرة والرحمة</p>
          <div className="points-display">
            <Star className="inline-block w-5 h-5 ml-2" />
            <span>{totalPoints} نقطة</span>
          </div>
        </div>
      </header>

      <div className={`top-bar ${isNavHidden ? 'hidden' : ''}`}>
        <div className="top-bar-content">
          <span>Developed by Bn Ramadan</span>
        </div>
        <a href="https://wa.me/+201025980987" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
          <svg className="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.287.129.332.202.045.073.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
          </svg>
          تواصل معي
        </a>
      </div>

      <main className="container">
        <div className="intro">
          <p>العشر الأواخر من رمضان قد حلت، وحان وقت اغتنام أثمن ليالي العام! شاركونا في تحدٍ يومي بسيط يوجهكم نحو عبادة أعمق، وروحانية أصفى، وأملٍ بأن نكون جميعًا من عتقاء الله في ليلة القدر.</p>
          <a href="#challenges" className="btn btn-accent">
            ابدأ الآن
          </a>
        </div>

        <div className="countdown-section">
          <h2 className="countdown-title">{new Date() < new Date('2025-03-19T23:59:59') ? 'متبقي على العشر الأواخر من رمضان' : 'متبقي من العشر الأواخر من رمضان'}</h2>
          <div className="countdown-grid">
            <div className="countdown-item">
              <div className="countdown-value">{convertToArabicNumbers(parseInt(timeLeft.split(' ')[0]))}</div>
              <div className="countdown-label">أيام</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-value">{convertToArabicNumbers(parseInt(timeLeft.split(' ')[2]))}</div>
              <div className="countdown-label">ساعات</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-value">{convertToArabicNumbers(parseInt(timeLeft.split(' ')[4]))}</div>
              <div className="countdown-label">دقائق</div>
            </div>
            <div className="countdown-item">
              <div className="countdown-value">{convertToArabicNumbers(parseInt(timeLeft.split(' ')[6]))}</div>
              <div className="countdown-label">ثواني</div>
            </div>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar" id="progressBar"></div>
          <div className="progress-text" id="progressText">
            أكملت {completedChallenges.length} من {challenges.length} تحديات
          </div>
        </div>

        <div className="dua-section">
          <h2>أدعية القرآن الكريم بالترتيب</h2>
          <div className="dua-selector">
            <select value={selectedDua.id} onChange={(e) => setSelectedDua(quranDuas.find((d) => d.id === parseInt(e.target.value)) || quranDuas[0])} className="dua-select">
              {quranDuas.map((dua) => (
                <option key={dua.id} value={dua.id}>
                  {`دعاء ${dua.id}`}
                </option>
              ))}
            </select>
          </div>
          <motion.div key={selectedDua.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="dua-text">
            {selectedDua.text}
          </motion.div>
        </div>

        <div className="dua-section">
          <h2>أفكار ذهبية خلال العشر الأواخر من رمضان</h2>
          <div className="dua-selector">
            <select value={selectedWasiya.id} onChange={(e) => setSelectedWasiya(wasaya.find((w) => w.id === parseInt(e.target.value)) || wasaya[0])} className="dua-select">
              {wasaya.map((wasiya) => (
                <option key={wasiya.id} value={wasiya.id}>
                  {`فكرة ${wasiya.id}`}
                </option>
              ))}
            </select>
          </div>
          <motion.div key={selectedWasiya.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="dua-text">
            {selectedWasiya.text}
          </motion.div>
        </div>

        <motion.div className="qadr-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h2>ليلة القدر</h2>
          <p>ليلة القدر خير من ألف شهر، تحرَّ ليلة القدر في الليالي الوترية من العشر الأواخر.</p>

          <div className="qadr-night-info">
            {qadrNightInfo.map((section, index) => (
              <div key={index} className="qadr-section">
                <h3>{section.title}</h3>
                <ul>
                  {section.points.map((point, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* قسم دعاء الشيخ محمد جبريل */}
          <section className="sheikh-dua-section">
            <div className="sheikh-dua-container">
              <div className="sheikh-dua-video">
                <iframe
                  title="دعاء ليلة القدر للشيخ محمد جبريل"
                  src="https://drive.google.com/file/d/1v7dwk6H15nFQptl2Wi8UrrSvwWrTOvs7/preview"
                  width="100%"
                  height="300"
                  allow="autoplay"
                  frameBorder="0"
                ></iframe>
              </div>
              <div className="sheikh-dua-content">
                <h3>دعاء الشيخ محمد جبريل</h3>
                <p>دعاء مبارك من فضيلة الشيخ محمد جبريل لليلة القدر المباركة. هذا الدعاء من أجمل الأدعية التي تقال في هذه الليلة المباركة، حيث يجمع بين البلاغة في الألفاظ وعمق المعاني.</p>
                <div className="sheikh-dua-meta">
                  <span className="sheikh-name">الشيخ محمد جبريل</span>
                  <span className="dua-duration">مدة الدعاء: 35 دقيقة</span>
                </div>
              </div>
            </div>
          </section>
        </motion.div>

        <motion.div className="daily-tip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p>{currentTip}</p>
        </motion.div>

        <div className="challenges" id="challenges">
          <h2>التحديات اليومية</h2>

          <div className="challenge-filters">
            <motion.button className={`challenge-filter ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              الكل
            </motion.button>
            <motion.button
              className={`challenge-filter ${activeFilter === 'prayer' ? 'active' : ''}`}
              onClick={() => setActiveFilter('prayer')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              الصلاة
            </motion.button>
            <motion.button className={`challenge-filter ${activeFilter === 'quran' ? 'active' : ''}`} onClick={() => setActiveFilter('quran')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              القرآن
            </motion.button>
            <motion.button
              className={`challenge-filter ${activeFilter === 'charity' ? 'active' : ''}`}
              onClick={() => setActiveFilter('charity')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              الصدقة
            </motion.button>
            <motion.button className={`challenge-filter ${activeFilter === 'dhikr' ? 'active' : ''}`} onClick={() => setActiveFilter('dhikr')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              الذكر
            </motion.button>
          </div>

          <div className="challenge-list">
            {filteredChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                className={`challenge-item ${completedChallenges.includes(challenge.id) ? 'completed' : ''} ${challenge.isQadrNight ? 'qadr-night' : ''}`}
                data-category={challenge.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <label className="challenge-checkbox">
                  <input type="checkbox" checked={completedChallenges.includes(challenge.id)} onChange={() => handleChallengeComplete(challenge.id)} className="challenge-check" />
                  <span className="checkmark"></span>
                </label>
                <div className="challenge-content">
                  <div className="challenge-title">{challenge.title}</div>
                  <div className="challenge-description">{challenge.description}</div>
                  <div className="challenge-meta">
                    <span className="challenge-badge">{challenge.difficulty}</span>
                    <span className="challenge-points">
                      <Star className="inline-block w-4 h-4 ml-1" />
                      {challenge.points} نقطة
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* إضافة قسم التحديات المخصصة */}
            <div className="challenges-header">
              <button className="add-challenge-btn" onClick={() => setShowAddChallenge(true)}>
                إضافة تحدي جديد +
              </button>
            </div>

            {/* عرض التحديات المخصصة */}
            {customChallenges
              .filter((challenge) => activeFilter === 'all' || challenge.category === activeFilter)
              .map((challenge) => (
                <motion.div key={challenge.id} className="challenge-item" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} whileHover={{ scale: 1.02 }}>
                  <label className="challenge-checkbox">
                    <input type="checkbox" checked={completedChallenges.includes(challenge.id)} onChange={() => handleChallengeComplete(challenge.id)} className="challenge-check" />
                    <span className="checkmark"></span>
                  </label>
                  <div className="challenge-content">
                    <div className="challenge-title">{challenge.title}</div>
                    <div className="challenge-description">{challenge.description}</div>
                    <div className="challenge-meta">
                      <span className="challenge-badge">{challenge.difficulty}</span>
                      <span className="challenge-points">
                        <Star className="inline-block w-4 h-4 ml-1" />
                        {challenge.points} نقطة
                      </span>
                      <button className="delete-btn" onClick={() => handleDeleteChallenge(challenge.id)}>
                        حذف
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* نافذة إضافة تحدي جديد */}
        {showAddChallenge && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>إضافة تحدي جديد</h3>
              <input type="text" placeholder="عنوان التحدي" value={newChallenge.title || ''} onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })} />
              <textarea placeholder="وصف التحدي" value={newChallenge.description || ''} onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })} />
              <select value={newChallenge.category} onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value as Challenge['category'] })}>
                <option value="prayer">الصلاة</option>
                <option value="quran">القرآن</option>
                <option value="charity">الصدقة</option>
                <option value="dhikr">الذكر</option>
              </select>
              <select value={newChallenge.difficulty} onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value as Challenge['difficulty'] })}>
                <option value="سهل">سهل</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
              </select>
              <input type="number" placeholder="النقاط" value={newChallenge.points} onChange={(e) => setNewChallenge({ ...newChallenge, points: parseInt(e.target.value) })} />
              <div className="modal-actions">
                <button className="add-btn" onClick={handleAddChallenge}>
                  إضافة
                </button>
                <button className="cancel-btn" onClick={() => setShowAddChallenge(false)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        <motion.div className="achievements-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2>الإنجازات</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`achievement-card ${unlockedAchievements.includes(achievement.id) ? 'unlocked' : 'locked'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <span className="achievement-points">{achievement.points} نقطة</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="dua-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2>دعاء اليوم</h2>
          <div className="dua-text">{currentDua}</div>
        </motion.div>
      </main>

      <footer>
        <div className="container">
          <div className="footer-content">
            <p className="footer-text">
              تم تصميم هذا الموقع بكل الحب للمسلمين في شهر رمضان المبارك 🤍، جاء هذا العمل ليكون رفيقكم في العشر الأواخر من رمضان، وليضيء دربكم في أعظم ليالي العام. نسأل الله أن يبلغنا وإياكم ليلة
              القدر، ويرزقنا خيرها ونورها، ويكتب لنا فيها القبول والعتق من النيران. 🤲🏼
            </p>
          </div>
        </div>
      </footer>

      <button className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop} aria-label="العودة للأعلى">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
        <div className="points-tooltip">نقاطك: {totalPoints}</div>
      </button>

      <div className={`stats-report ${showStats ? 'visible' : ''}`}>
        <div className="stats-content">
          <button className="close-stats" onClick={() => setShowStats(false)}>
            ×
          </button>
          <div className="stats-header">
            <h2>تقرير العشر الأواخر</h2>
            <p>إحصائيات أدائك خلال العشر الأواخر</p>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{getStats().completedCount}</div>
              <div className="stat-label">التحديات المكتملة</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{getStats().completionRate}%</div>
              <div className="stat-label">نسبة الإنجاز</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{getStats().totalPoints}</div>
              <div className="stat-label">إجمالي النقاط</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{getStats().averagePointsPerDay}</div>
              <div className="stat-label">متوسط النقاط اليومي</div>
            </div>
          </div>

          <div className="stats-summary">
            <h3>توزيع التحديات حسب الفئة</h3>
            <p>
              الصلاة: {getStats().categoryStats.prayer} تحديات
              <br />
              القرآن: {getStats().categoryStats.quran} تحديات
              <br />
              الصدقة: {getStats().categoryStats.charity} تحديات
              <br />
              الذكر: {getStats().categoryStats.dhikr} تحديات
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
