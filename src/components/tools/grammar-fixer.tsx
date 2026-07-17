"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  SpellCheck,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Info,
} from "lucide-react"

const SAMPLE_TEXTS = [
  "Their are many ways too improve your writing skills. Its important too practice regularly and seek feedback from others. The key is two be consistent and never give up on youre goals. Every day you can make progress if you put in the effort. Alot of people struggle with there writing, but with practice it becomes easier.",
  "The company's financial report was prepeared by the accouting department. They had reviewed the numbers carefully before submiting it too the board of directors. However their was a mistake in the quarterly projections which caused confusion among the stakeholders. The team have been working hard to fix the issues.",
  "He dont think that the project will be finish on time. The team have been working hard but their facing several challenges. The manager should of assigned more resources to the project from the start. Their is still time too make things right if we act quickly.",
  "Its a beautiful day outside. The whether is perfect for a picnic. I cant wait to meet you at the park. Your going too love the surprise I have planned. Theirs so much too see and do. Every thing is going to be alright.",
]

interface Correction {
  original: string
  corrected: string
  explanation: string
}

type Rule = { pattern: RegExp; correct: string | ((m: string) => string); explanation: string }
const RULES: Rule[] = [
  { pattern: /\b([Tt])heir\s+are\b/g, correct: "$1here are", explanation: "Use 'There are' to indicate existence of something" },
  { pattern: /\b([Tt])heir\s+was\b/g, correct: "$1here was", explanation: "Use 'There was' to indicate existence of something" },
  { pattern: /\b([Tt])heir\s+were\b/g, correct: "$1here were", explanation: "Use 'There were' to indicate existence of something" },
  { pattern: /\b([Tt])heir\s+will\b/g, correct: "$1here will", explanation: "Use 'There will' to indicate future existence" },
  { pattern: /\b([Tt])heir\s+is\b/g, correct: "$1here is", explanation: "Use 'There is' to indicate existence of something" },
  { pattern: /\b([Tt])heir\s+has\b/g, correct: "$1here has", explanation: "Use 'There has' to indicate existence" },
  { pattern: /\b([Tt])heir\s+have\b/g, correct: "$1here have", explanation: "Use 'There have' to indicate existence" },
  { pattern: /\b([Tt])heir\s+had\b/g, correct: "$1here had", explanation: "Use 'There had' to indicate past existence" },
  { pattern: /\byoure\b/gi, correct: "your", explanation: "Use 'your' as possessive form (belonging to you)" },
  { pattern: /\byoure\s+(a|an|the|my|is|are|was|were|have|has|had|will|can|could)\b/gi, correct: "you're $1", explanation: "Use 'you're' as contraction of 'you are'" },
  { pattern: /\bits\s+(a|an|the|my|your|his|her|its|our|their|this|that)\b/gi, correct: "it's $1", explanation: "Use 'it's' as contraction of 'it is'" },
  { pattern: /\bits\s+(very|quite|rather|extremely|incredibly|absolutely|really)\b/gi, correct: "it's $1", explanation: "Use 'it's' as contraction of 'it is'" },
  { pattern: /\bim\b/gi, correct: "I'm", explanation: "Use 'I'm' as contraction of 'I am'" },
  { pattern: /\bdont\b/gi, correct: "don't", explanation: "Add apostrophe for contraction of 'do not'" },
  { pattern: /\bdoesnt\b/gi, correct: "doesn't", explanation: "Add apostrophe for contraction of 'does not'" },
  { pattern: /\bdidnt\b/gi, correct: "didn't", explanation: "Add apostrophe for contraction of 'did not'" },
  { pattern: /\bwont\b/gi, correct: "won't", explanation: "Add apostrophe for contraction of 'will not'" },
  { pattern: /\bcouldnt\b/gi, correct: "couldn't", explanation: "Add apostrophe for contraction of 'could not'" },
  { pattern: /\bwouldnt\b/gi, correct: "wouldn't", explanation: "Add apostrophe for contraction of 'would not'" },
  { pattern: /\bshouldnt\b/gi, correct: "shouldn't", explanation: "Add apostrophe for contraction of 'should not'" },
  { pattern: /\bisnt\b/gi, correct: "isn't", explanation: "Add apostrophe for contraction of 'is not'" },
  { pattern: /\barent\b/gi, correct: "aren't", explanation: "Add apostrophe for contraction of 'are not'" },
  { pattern: /\bwasnt\b/gi, correct: "wasn't", explanation: "Add apostrophe for contraction of 'was not'" },
  { pattern: /\bwerent\b/gi, correct: "weren't", explanation: "Add apostrophe for contraction of 'were not'" },
  { pattern: /\bhavent\b/gi, correct: "haven't", explanation: "Add apostrophe for contraction of 'have not'" },
  { pattern: /\bhasnt\b/gi, correct: "hasn't", explanation: "Add apostrophe for contraction of 'has not'" },
  { pattern: /\bhadnt\b/gi, correct: "hadn't", explanation: "Add apostrophe for contraction of 'had not'" },
  { pattern: /\bcant\b/gi, correct: "can't", explanation: "Add apostrophe for contraction of 'cannot'" },
  { pattern: /\bwont\b/gi, correct: "won't", explanation: "Add apostrophe for contraction of 'will not'" },
  { pattern: /\bdont\b/gi, correct: "don't", explanation: "Add apostrophe for contraction of 'do not'" },
  { pattern: /\byoure\b/gi, correct: "you're", explanation: "Use 'you're' as contraction of 'you are'" },
  { pattern: /\btheyre\b/gi, correct: "they're", explanation: "Use 'they're' as contraction of 'they are'" },
  { pattern: /\bweyre\b/gi, correct: "we're", explanation: "Use 'we're' as contraction of 'we are'" },
  { pattern: /\bshould\s+of\b/gi, correct: "should have", explanation: "Use 'should have' instead of 'should of'" },
  { pattern: /\bwould\s+of\b/gi, correct: "would have", explanation: "Use 'would have' instead of 'would of'" },
  { pattern: /\bcould\s+of\b/gi, correct: "could have", explanation: "Use 'could have' instead of 'could of'" },
  { pattern: /\bmight\s+of\b/gi, correct: "might have", explanation: "Use 'might have' instead of 'might of'" },
  { pattern: /\bmust\s+of\b/gi, correct: "must have", explanation: "Use 'must have' instead of 'must of'" },
  { pattern: /\bprepear\w*\b/gi, correct: "prepare", explanation: "Correct spelling of 'prepare'" },
  { pattern: /\bprepaired\b/gi, correct: "prepared", explanation: "Correct spelling of 'prepared'" },
  { pattern: /\bprepearing\b/gi, correct: "preparing", explanation: "Correct spelling of 'preparing'" },
  { pattern: /\boccured\b/gi, correct: "occurred", explanation: "Double the 'r' in past tense of 'occur'" },
  { pattern: /\boccuring\b/gi, correct: "occurring", explanation: "Double the 'r' in present participle of 'occur'" },
  { pattern: /\boccurance\b/gi, correct: "occurrence", explanation: "Correct spelling - 'occurrence' has double 'c' and double 'r'" },
  { pattern: /\brecieve\w*\b/gi, correct: (m: string) => m.replace(/recieve/gi, "recei" + (m.toLowerCase().includes("d") ? "ved" : "ve")), explanation: "I before E except after C" },
  { pattern: /\breciept\b/gi, correct: "receipt", explanation: "Correct spelling - 'i before e' rule" },
  { pattern: /\baccomodat\w*\b/gi, correct: (m: string) => m.replace(/accomodat/gi, "accommodat"), explanation: "Double the 'm' and 'c' in 'accommodate'" },
  { pattern: /\bacomodat\w*\b/gi, correct: (m: string) => m.replace(/acomodat/gi, "accommodat"), explanation: "Double the 'c' and 'm' in 'accommodate'" },
  { pattern: /\bcalender\b/gi, correct: "calendar", explanation: "Correct spelling of 'calendar' (ends with -ar)" },
  { pattern: /\bdefinately\b/gi, correct: "definitely", explanation: "Correct spelling of 'definitely' (finite + ly)" },
  { pattern: /\bdefinitly\b/gi, correct: "definitely", explanation: "Correct spelling of 'definitely'" },
  { pattern: /\bseperate\b/gi, correct: "separate", explanation: "There's 'a rat' in separate - remember the 'a'" },
  { pattern: /\btommorow\b/gi, correct: "tomorrow", explanation: "Correct spelling of 'tomorrow' (one m, two r's)" },
  { pattern: /\btommorrow\b/gi, correct: "tomorrow", explanation: "Correct spelling of 'tomorrow'" },
  { pattern: /\balot\b/gi, correct: "a lot", explanation: "'a lot' is two words, not one" },
  { pattern: /\balright\b/gi, correct: "all right", explanation: "'all right' is more formal as two words" },
  { pattern: /\bwierd\b/gi, correct: "weird", explanation: "Weird breaks the 'i before e' rule - it's an exception" },
  { pattern: /\bacheive\b/gi, correct: "achieve", explanation: "I before E except after C - 'achieve'" },
  { pattern: /\bbeleive\b/gi, correct: "believe", explanation: "I before E except after C - 'believe'" },
  { pattern: /\bnieghbor\w*\b/gi, correct: (m: string) => m.replace(/nieghbor/gi, "neighbor"), explanation: "Correct spelling of 'neighbor'" },
  { pattern: /\blieutenant\b/gi, correct: "lieutenant", explanation: "Correct spelling of 'lieutenant'" },
  { pattern: /\bpriviledge\b/gi, correct: "privilege", explanation: "Correct spelling of 'privilege' (no 'd')" },
  { pattern: /\bprivelege\b/gi, correct: "privilege", explanation: "Correct spelling of 'privilege'" },
  { pattern: /\bneccessary\b/gi, correct: "necessary", explanation: "One 'c', two 's's in 'necessary'" },
  { pattern: /\bneccesary\b/gi, correct: "necessary", explanation: "One 'c', two 's's in 'necessary'" },
  { pattern: /\bembarass\w*\b/gi, correct: (m: string) => m.replace(/embarass/gi, "embarrass"), explanation: "Double 'r' and double 's' in 'embarrass'" },
  { pattern: /\bembaras\w*\b/gi, correct: (m: string) => m.replace(/embaras/gi, "embarrass"), explanation: "Double 'r' and double 's' in 'embarrass'" },
  { pattern: /\bharass\b/gi, correct: "harass", explanation: "One 'r', two 's's in 'harass'" },
  { pattern: /\bharas\b/gi, correct: "harass", explanation: "One 'r', two 's's in 'harass'" },
  { pattern: /\bpublicaly\b/gi, correct: "publicly", explanation: "Correct spelling - 'publicly' ends with -cly" },
  { pattern: /\bpublickly\b/gi, correct: "publicly", explanation: "Correct spelling of 'publicly'" },
  { pattern: /\bpharoah\b/gi, correct: "pharaoh", explanation: "Correct spelling of 'pharaoh'" },
  { pattern: /\bpotatoe\b/gi, correct: "potato", explanation: "Singular 'potato' has no 'e'" },
  { pattern: /\btomatos\b/gi, correct: "tomatoes", explanation: "Plural of 'tomato' adds -es" },
  { pattern: /\bpotatos\b/gi, correct: "potatoes", explanation: "Plural of 'potato' adds -es" },
  { pattern: /\bheroes\b/gi, correct: "heroes", explanation: "Plural of 'hero' adds -es" },
  { pattern: /\bcuriculum\b/gi, correct: "curriculum", explanation: "Correct spelling of 'curriculum' (double r)" },
  { pattern: /\bcurriculem\b/gi, correct: "curriculum", explanation: "Correct spelling of 'curriculum'" },
  { pattern: /\breffer\w*\b/gi, correct: (m: string) => m.replace(/reffer/gi, "refer"), explanation: "'Refer' has one 'f' - double the 'r' when adding -ed/-ing" },
  { pattern: /\bhe\s+don't\b/gi, correct: "he doesn't", explanation: "Third person singular requires 'doesn't'" },
  { pattern: /\bshe\s+don't\b/gi, correct: "she doesn't", explanation: "Third person singular requires 'doesn't'" },
  { pattern: /\bit\s+don't\b/gi, correct: "it doesn't", explanation: "Third person singular requires 'doesn't'" },
  { pattern: /\bthe\s+team\s+have\b/gi, correct: "the team has", explanation: "Collective nouns typically take singular verbs" },
  { pattern: /\bthe\s+company\s+have\b/gi, correct: "the company has", explanation: "Collective nouns typically take singular verbs" },
  { pattern: /\bthe\s+committee\s+have\b/gi, correct: "the committee has", explanation: "Collective nouns typically take singular verbs" },
  { pattern: /\byour\s+right\b/gi, correct: "you're right", explanation: "Use 'you're right' (you are correct)" },
  { pattern: /\bwhose\s+right\b/gi, correct: "who's right", explanation: "Use 'who's right' (who is right)" },
  { pattern: /\bits\s+nice\b/gi, correct: "it's nice", explanation: "Use 'it's nice' (it is nice)" },
  { pattern: /\byour\s+welcome\b/gi, correct: "you're welcome", explanation: "Use 'you're welcome' (you are welcome)" },
  { pattern: /\bweather\s+(its|its)\b/gi, correct: "whether it's", explanation: "Use 'whether' for alternatives, not weather" },
  { pattern: /\btheir\s+going\b/gi, correct: "they're going", explanation: "Use 'they're going' (they are going)" },
  { pattern: /\btheir\s+not\b/gi, correct: "they're not", explanation: "Use 'they're not' (they are not)" },
  { pattern: /\baffects?\s+to\b/gi, correct: "effects on", explanation: "Use 'effects on' rather than 'affects to'" },
  { pattern: /\blose\s+loose\b/gi, correct: "loose", explanation: "'Loose' is the opposite of tight; 'lose' means to misplace" },
  { pattern: /\bthen\s+(he|she|it|they|we|you)\s+(should|would|could|will|can)\b/gi, correct: "than $1 $2", explanation: "Use 'than' for comparisons, 'then' for time" },
  { pattern: /\bhe\s+go\b/gi, correct: "he goes", explanation: "Third person singular requires verb + 's'" },
  { pattern: /\bshe\s+go\b/gi, correct: "she goes", explanation: "Third person singular requires verb + 's'" },
  { pattern: /\bhe\s+do\b/gi, correct: "he does", explanation: "Third person singular requires 'does'" },
  { pattern: /\bshe\s+do\b/gi, correct: "she does", explanation: "Third person singular requires 'does'" },
  { pattern: /\bthese\s+one\b/gi, correct: "this one", explanation: "Use 'this one' for singular, 'these ones' for plural" },
  { pattern: /\bthats\b/gi, correct: "that's", explanation: "Use 'that's' as contraction of 'that is'" },
  { pattern: /\bwhos\b/gi, correct: "who's", explanation: "Use 'who's' as contraction of 'who is' or 'who has'" },
  { pattern: /\bwhats\b/gi, correct: "what's", explanation: "Use 'what's' as contraction of 'what is'" },
  { pattern: /\bheres\b/gi, correct: "here's", explanation: "Use 'here's' as contraction of 'here is'" },
  { pattern: /\btheres\b/gi, correct: "there's", explanation: "Use 'there's' as contraction of 'there is'" },
  { pattern: /\bthe.\b(?!\s*[a-z])/gi, correct: "the", explanation: "Remove unnecessary period after 'the'" },
  { pattern: /\bevery\s+thing\b/gi, correct: "everything", explanation: "'Everything' is one word" },
  { pattern: /\bevery\s+one\b/gi, correct: "everyone", explanation: "'Everyone' is one word (when meaning everybody)" },
  { pattern: /\bsome\s+thing\b/gi, correct: "something", explanation: "'Something' is one word" },
  { pattern: /\bany\s+thing\b/gi, correct: "anything", explanation: "'Anything' is one word" },
  { pattern: /\bno\s+thing\b/gi, correct: "nothing", explanation: "'Nothing' is one word" },
  { pattern: /\bin\tact\b/gi, correct: "intact", explanation: "'Intact' is one word" },
  { pattern: /\ba\s+while\s+back\b/gi, correct: "a while back", explanation: "'A while' is two words when referring to time" },
  { pattern: /\balot\s+of\b/gi, correct: "a lot of", explanation: "'A lot of' is three words" },
  { pattern: /\bhe\s+(does|did)\s+(works|goes|takes|makes|gets)\b/gi, correct: "he $1 $2", explanation: "Don't add 's' to the main verb after 'does' or 'did'" },
  { pattern: /\bsubmited\b/gi, correct: "submitted", explanation: "Double the 't' when adding -ed to 'submit'" },
  { pattern: /\bsubmiting\b/gi, correct: "submitting", explanation: "Double the 't' when adding -ing to 'submit'" },
  { pattern: /\btransfered\b/gi, correct: "transferred", explanation: "Double the 'r' when adding -ed to 'transfer'" },
  { pattern: /\btransfering\b/gi, correct: "transferring", explanation: "Double the 'r' when adding -ing to 'transfer'" },
  { pattern: /\bbegining\b/gi, correct: "beginning", explanation: "Double the 'n' when adding -ing to 'begin'" },
  { pattern: /\bcommited\b/gi, correct: "committed", explanation: "Double the 't' when adding -ed to 'commit'" },
  { pattern: /\bcommiting\b/gi, correct: "committing", explanation: "Double the 't' when adding -ing to 'commit'" },
  { pattern: /\baccidently\b/gi, correct: "accidentally", explanation: "Correct spelling of 'accidentally'" },
  { pattern: /\baccidently\b/gi, correct: "accidentally", explanation: "Correct spelling of 'accidentally'" },
  { pattern: /\bappologize\b/gi, correct: "apologize", explanation: "Correct spelling of 'apologize'" },
  { pattern: /\bapparantly\b/gi, correct: "apparently", explanation: "Correct spelling of 'apparently'" },
  { pattern: /\barguement\b/gi, correct: "argument", explanation: "Correct spelling of 'argument' (no 'e')" },
  { pattern: /\bawfull\b/gi, correct: "awful", explanation: "Correct spelling of 'awful' (one 'l')" },
  { pattern: /\bbatery\b/gi, correct: "battery", explanation: "Correct spelling of 'battery' (double 't')" },
  { pattern: /\bbegginer\b/gi, correct: "beginner", explanation: "Double the 'n' in 'beginner'" },
  { pattern: /\bbehaviour\b/gi, correct: "behavior", explanation: "American English: 'behavior' (UK: 'behaviour')" },
  { pattern: /\bcheif\b/gi, correct: "chief", explanation: "I before E - 'chief'" },
  { pattern: /\bconcensus\b/gi, correct: "consensus", explanation: "Correct spelling of 'consensus' (not 'concensus')" },
  { pattern: /\bdesparate\b/gi, correct: "desperate", explanation: "Correct spelling of 'desperate'" },
  { pattern: /\bdicotomy\b/gi, correct: "dichotomy", explanation: "Correct spelling of 'dichotomy'" },
  { pattern: /\bdissapoint\w*\b/gi, correct: (m: string) => m.replace(/dissapoint/gi, "disappoint"), explanation: "One 's', double 'p' in 'disappoint'" },
  { pattern: /\bembarass\w*\b/gi, correct: (m: string) => m.replace(/embarass/gi, "embarrass"), explanation: "Double 'r' and double 's' in 'embarrass'" },
  { pattern: /\benviroment\w*\b/gi, correct: (m: string) => m.replace(/enviroment/gi, "environment"), explanation: "Correct spelling of 'environment' (has an 'n')" },
  { pattern: /\bexagerate\b/gi, correct: "exaggerate", explanation: "Double 'g' in 'exaggerate'" },
  { pattern: /\bexellent\b/gi, correct: "excellent", explanation: "Correct spelling of 'excellent'" },
  { pattern: /\bfebuary\b/gi, correct: "February", explanation: "Correct spelling of 'February' (first 'r')" },
  { pattern: /\bflourescent\b/gi, correct: "fluorescent", explanation: "Correct spelling of 'fluorescent'" },
  { pattern: /\bforiegn\b/gi, correct: "foreign", explanation: "Correct spelling of 'foreign' (e before i)" },
  { pattern: /\bfourty\b/gi, correct: "forty", explanation: "Correct spelling: 'forty' (not 'fourty')" },
  { pattern: /\bgoverment\b/gi, correct: "government", explanation: "Correct spelling of 'government' (has an 'n')" },
  { pattern: /\bguage\b/gi, correct: "gauge", explanation: "Correct spelling of 'gauge'" },
  { pattern: /\bgrammer\b/gi, correct: "grammar", explanation: "Correct spelling of 'grammar'" },
  { pattern: /\bharrass\b/gi, correct: "harass", explanation: "One 'r', two 's's in 'harass'" },
  { pattern: /\bhemorrage\b/gi, correct: "hemorrhage", explanation: "Correct spelling of 'hemorrhage'" },
  { pattern: /\bhygeine\b/gi, correct: "hygiene", explanation: "Correct spelling of 'hygiene'" },
  { pattern: /\bindependance\b/gi, correct: "independence", explanation: "Correct spelling: 'independence' (ends with -ence)" },
  { pattern: /\binnoculate\b/gi, correct: "inoculate", explanation: "One 'n' in 'inoculate'" },
  { pattern: /\bindictment\b/gi, correct: "indictment", explanation: "'Indictment' has a silent 'c'" },
  { pattern: /\bjewlery\b/gi, correct: "jewelry", explanation: "Correct spelling of 'jewelry'" },
  { pattern: /\blibel\b/gi, correct: "libel", explanation: "Correct spelling of 'libel'" },
  { pattern: /\bliason\b/gi, correct: "liaison", explanation: "Correct spelling of 'liaison'" },
  { pattern: /\blollipop\b/gi, correct: "lollipop", explanation: "Correct spelling of 'lollipop'" },
  { pattern: /\bmaintainance\b/gi, correct: "maintenance", explanation: "Correct spelling: 'maintenance' (not main+tain+ance)" },
  { pattern: /\bmediterranean\b/gi, correct: "Mediterranean", explanation: "Double 'r' and 'n' in 'Mediterranean'" },
  { pattern: /\bmillenium\b/gi, correct: "millennium", explanation: "Double 'l', double 'n' in 'millennium'" },
  { pattern: /\bminuscule\b/gi, correct: "minuscule", explanation: "Correct spelling of 'minuscule'" },
  { pattern: /\bmisspell\b/gi, correct: "misspell", explanation: "Double 's' in 'misspell'" },
  { pattern: /\bneice\b/gi, correct: "niece", explanation: "I before E - 'niece'" },
  { pattern: /\bnineth\b/gi, correct: "ninth", explanation: "Correct spelling of 'ninth' (no 'e')" },
  { pattern: /\bnoticable\b/gi, correct: "noticeable", explanation: "Keep the 'e' before adding -able: 'noticeable'" },
  { pattern: /\boccassion\b/gi, correct: "occasion", explanation: "One 'c', one 's' in 'occasion'" },
  { pattern: /\boppurtunity\b/gi, correct: "opportunity", explanation: "Double 'p', double 't' in 'opportunity'" },
  { pattern: /\boriginall\b/gi, correct: "original", explanation: "Correct spelling of 'original'" },
  { pattern: /\bparalel\b/gi, correct: "parallel", explanation: "Three 'l's in 'parallel'" },
  { pattern: /\bparalell\b/gi, correct: "parallel", explanation: "Three 'l's: par-al-lel" },
  { pattern: /\bperogative\b/gi, correct: "prerogative", explanation: "Correct spelling: 'prerogative'" },
  { pattern: /\bperseverence\b/gi, correct: "perseverance", explanation: "Correct spelling of 'perseverance'" },
  { pattern: /\bphemonenon\b/gi, correct: "phenomenon", explanation: "Correct spelling of 'phenomenon'" },
  { pattern: /\bpomagranate\b/gi, correct: "pomegranate", explanation: "Correct spelling of 'pomegranate'" },
  { pattern: /\bposession\b/gi, correct: "possession", explanation: "Four 's's in 'possession'" },
  { pattern: /\bprefered\b/gi, correct: "preferred", explanation: "Double the 'r' when adding -ed to 'prefer'" },
  { pattern: /\bprefering\b/gi, correct: "preferring", explanation: "Double the 'r' when adding -ing to 'prefer'" },
  { pattern: /\bprescription\b/gi, correct: "prescription", explanation: "Correct spelling: 'prescription' (pre-, not per-)" },
  { pattern: /\bpreventative\b/gi, correct: "preventive", explanation: "'Preventive' is preferred over 'preventative'" },
  { pattern: /\bpriviledge\b/gi, correct: "privilege", explanation: "Correct spelling: 'privilege' (no 'd')" },
  { pattern: /\bprocede\b/gi, correct: "proceed", explanation: "Correct spelling: 'proceed' (not 'procede')" },
  { pattern: /\bpublicly\b/gi, correct: "publicly", explanation: "Correct spelling: 'publicly'" },
  { pattern: /\brealise\b/gi, correct: "realize", explanation: "American English: 'realize' (UK: 'realise')" },
  { pattern: /\breccomend\b/gi, correct: "recommend", explanation: "One 'c', two 'm's in 'recommend'" },
  { pattern: /\brefered\b/gi, correct: "referred", explanation: "Double the 'r' when adding -ed to 'refer'" },
  { pattern: /\brefering\b/gi, correct: "referring", explanation: "Double the 'r' when adding -ing to 'refer'" },
  { pattern: /\brelevent\b/gi, correct: "relevant", explanation: "Correct spelling of 'relevant'" },
  { pattern: /\brepetition\b/gi, correct: "repetition", explanation: "Correct spelling of 'repetition'" },
  { pattern: /\bresponsible\b/gi, correct: "responsible", explanation: "Correct spelling of 'responsible'" },
  { pattern: /\brhythm\b/gi, correct: "rhythm", explanation: "Correct spelling: 'rhythm' (h y t h m)" },
  { pattern: /\brythm\b/gi, correct: "rhythm", explanation: "Correct spelling: 'rhythm'" },
  { pattern: /\bsargeant\b/gi, correct: "sergeant", explanation: "Correct spelling: 'sergeant'" },
  { pattern: /\bseige\b/gi, correct: "siege", explanation: "I before E - 'siege'" },
  { pattern: /\bsence\b/gi, correct: "sense", explanation: "Correct spelling: 'sense'" },
  { pattern: /\bsupercede\b/gi, correct: "supersede", explanation: "Correct spelling: 'supersede' (only word ending in -sede)" },
  { pattern: /\bsuprise\b/gi, correct: "surprise", explanation: "Correct spelling: 'surprise' (sur-, not su-)" },
  { pattern: /\btatoo\b/gi, correct: "tattoo", explanation: "Double 't', double 'o': 'tattoo'" },
  { pattern: /\btenative\b/gi, correct: "tentative", explanation: "Correct spelling: 'tentative'" },
  { pattern: /\btheatre\b/gi, correct: "theater", explanation: "American English: 'theater' (UK: 'theatre')" },
  { pattern: /\bthreshold\b/gi, correct: "threshold", explanation: "Correct spelling: 'threshold' (one 'h')" },
  { pattern: /\btomarrow\b/gi, correct: "tomorrow", explanation: "Correct spelling: 'tomorrow'" },
  { pattern: /\btounge\b/gi, correct: "tongue", explanation: "Correct spelling: 'tongue' (gue ending)" },
  { pattern: /\btruely\b/gi, correct: "truly", explanation: "Correct spelling: 'truly' (no 'e')" },
  { pattern: /\bunforseen\b/gi, correct: "unforeseen", explanation: "Double 'e' in 'unforeseen'" },
  { pattern: /\bunnecessary\b/gi, correct: "unnecessary", explanation: "One 'n', double 'c', double 's' in 'unnecessary'" },
  { pattern: /\bupmost\b/gi, correct: "utmost", explanation: "'Utmost' means greatest; 'upmost' means highest position" },
  { pattern: /\bvaccum\b/gi, correct: "vacuum", explanation: "Double 'u' in 'vacuum'" },
  { pattern: /\bvegeterian\b/gi, correct: "vegetarian", explanation: "Correct spelling of 'vegetarian'" },
  { pattern: /\bvehical\b/gi, correct: "vehicle", explanation: "Correct spelling of 'vehicle'" },
  { pattern: /\bvisious\b/gi, correct: "vicious", explanation: "Correct spelling of 'vicious'" },
  { pattern: /\bweather\s+their\b/gi, correct: "whether there", explanation: "'Whether' for alternatives, 'there' for place/existence" },
  { pattern: /\bwhat\s+ever\b/gi, correct: "whatever", explanation: "'Whatever' is one word" },
  { pattern: /\bwich\b/gi, correct: "which", explanation: "Correct spelling: 'which'" },
  { pattern: /\bwintery\b/gi, correct: "wintry", explanation: "Correct spelling: 'wintry' (not 'wintery')" },
  { pattern: /\bwith\s+hold\b/gi, correct: "withhold", explanation: "Double 'h' in 'withhold'" },
  { pattern: /\bwritting\b/gi, correct: "writing", explanation: "One 't' in 'writing' (write + ing)" },
  { pattern: /\bwriten\b/gi, correct: "written", explanation: "Double 't' in 'written'" },
  { pattern: /\byourselfs\b/gi, correct: "yourselves", explanation: "Plural of 'yourself' is 'yourselves'" },
  { pattern: /\bzealous\b/gi, correct: "zealous", explanation: "Correct spelling of 'zealous'" },
]

function generateCorrections(text: string): { fixed: string; changes: Correction[] } {
  let fixed = text
  const changes: Correction[] = []
  const seen = new Set<string>()

  for (const rule of RULES) {
    const matches = Array.from(fixed.matchAll(rule.pattern))
    for (const match of matches) {
      const original = match[0]
      const key = original.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)

      let corrected: string
      if (typeof rule.correct === "function") {
        corrected = rule.correct(original)
      } else {
        corrected = original.replace(rule.pattern, rule.correct)
      }

      if (original !== corrected) {
        changes.push({ original, corrected, explanation: rule.explanation })
      }
    }
    fixed = fixed.replace(rule.pattern, rule.correct as string)
  }

  const subjectVerbAgreements = [
    { pattern: /\b(he|she|it)\s+(have)\b/gi, correct: "$1 has", explanation: "Third person singular requires 'has'" },
    { pattern: /\b(they|we|you|i)\s+(has)\b/gi, correct: "$1 have", explanation: "Plural subjects require 'have'" },
    { pattern: /\b(he|she|it)\s+(do)\s+not\b/gi, correct: "$1 does not", explanation: "Third person singular requires 'does not'" },
  ]
  for (const { pattern, correct, explanation } of subjectVerbAgreements) {
    if (pattern.test(fixed)) {
      const match = fixed.match(pattern)
      if (match && match[0]) {
        const corrected = match[0].replace(pattern, correct as string)
        if (match[0] !== corrected) {
          changes.push({ original: match[0], corrected, explanation })
          fixed = fixed.replace(pattern, correct as string)
        }
      }
    }
  }

  return { fixed, changes }
}

function highlightDiff(original: string, changes: Correction[]): React.ReactNode {
  if (changes.length === 0) return <span>{original}</span>

  let result = original
  const nodes: React.ReactNode[] = [result]

  for (const change of changes) {
    const idx = nodes.length - 1
    const last = nodes[idx]
    if (typeof last !== "string") continue

    const parts = last.split(change.original)
    if (parts.length > 1) {
      const newNodes: React.ReactNode[] = []
      parts.forEach((part, i) => {
        newNodes.push(part)
        if (i < parts.length - 1) {
          newNodes.push(
            <span key={`${change.original}-${i}`} className="relative inline-flex flex-wrap items-center gap-1">
              <span className="rounded bg-red-500/20 px-0.5 text-red-500 line-through decoration-red-500">{change.original}</span>
              <span className="text-muted-foreground">→</span>
              <span className="rounded bg-emerald-500/20 px-0.5 text-emerald-500">{change.corrected}</span>
            </span>
          )
        }
      })
      nodes.splice(idx, 1, ...newNodes)
    }
  }

  return <span>{nodes}</span>
}

export function GrammarFixer() {
  const [text, setText] = React.useState("")
  const [output, setOutput] = React.useState<{ fixed: string; changes: Correction[] } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  const handleFix = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to fix")
      return
    }

    setLoading(true)
    setProgress(0)

    const result = generateCorrections(text)
    setProgress(100)
    setOutput(result)
    setLoading(false)
    toast.success(`${result.changes.length} correction${result.changes.length !== 1 ? "s" : ""} found and applied`)
  }, [text])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output.fixed)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  const handleReset = React.useCallback(() => {
    setText("")
    setOutput(null)
    setCopied(false)
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <SpellCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Grammar Fixer</h1>
          <p className="text-sm text-muted-foreground">Fix grammar and spelling errors with 150+ rules</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Text to Fix</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type text with grammar errors..."
            rows={6}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleFix}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Fix Grammar
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Analyzing text..." />
        )}
      </Card>

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm font-medium text-foreground">Fixed Text</span>
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
                    onClick={handleReset}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </motion.button>
                </div>
              </div>
              <div className="p-5">
                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {highlightDiff(output.fixed, output.changes)}
                </p>
              </div>
            </div>

            {output.changes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {output.changes.length} Correction{output.changes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {output.changes.map((change, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3 p-4"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs font-medium text-red-500 line-through">
                            {change.original}
                          </span>
                          <span className="text-xs text-muted-foreground">→</span>
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-medium text-emerald-500">
                            {change.corrected}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{change.explanation}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
