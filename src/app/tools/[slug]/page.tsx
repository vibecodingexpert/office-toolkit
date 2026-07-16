"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { getToolBySlug } from "@/lib/utils/tools-data"
import { useToolStore } from "@/lib/store/use-tool-store"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileQuestion } from "lucide-react"
import type { Tool } from "@/types"

import { PdfToWord } from "@/components/tools/pdf-to-word"
import { WordToPdf } from "@/components/tools/word-to-pdf"
import { PdfToExcel } from "@/components/tools/pdf-to-excel"
import { ExcelToPdf } from "@/components/tools/excel-to-pdf"
import { PdfToPpt } from "@/components/tools/pdf-to-ppt"
import { PptToPdf } from "@/components/tools/ppt-to-pdf"
import { MergePdf } from "@/components/tools/merge-pdf"
import { SplitPdf } from "@/components/tools/split-pdf"
import { CompressPdf } from "@/components/tools/compress-pdf"
import { RotatePdf } from "@/components/tools/rotate-pdf"
import { UnlockPdf } from "@/components/tools/unlock-pdf"
import { LockPdf } from "@/components/tools/lock-pdf"
import { WatermarkPdf } from "@/components/tools/watermark-pdf"
import { SignPdf } from "@/components/tools/sign-pdf"
import { OcrPdf } from "@/components/tools/ocr-pdf"
import { ExtractImagesPdf } from "@/components/tools/extract-images-pdf"
import { ExtractTextPdf } from "@/components/tools/extract-text-pdf"
import { DeletePages } from "@/components/tools/delete-pages"
import { ReorderPages } from "@/components/tools/reorder-pages"
import { CropPdf } from "@/components/tools/crop-pdf"
import { ImagesToPdf } from "@/components/tools/images-to-pdf"
import { HtmlToPdf } from "@/components/tools/html-to-pdf"
import { PdfToJpg } from "@/components/tools/pdf-to-jpg"
import { JpgToPdf } from "@/components/tools/jpg-to-pdf"
import { BackgroundRemover } from "@/components/tools/background-remover"
import { ImageCompressor } from "@/components/tools/image-compressor"
import { ImageUpscaler } from "@/components/tools/image-upscaler"
import { ResizeImage } from "@/components/tools/resize-image"
import { CropImage } from "@/components/tools/crop-image"
import { RotateImage } from "@/components/tools/rotate-image"
import { FlipImage } from "@/components/tools/flip-image"
import { BlurBackground } from "@/components/tools/blur-background"
import { AiEnhance } from "@/components/tools/ai-enhance"
import { ImageToPng } from "@/components/tools/image-to-png"
import { PngToJpg } from "@/components/tools/png-to-jpg"
import { JpgToWebp } from "@/components/tools/jpg-to-webp"
import { WebpConverter } from "@/components/tools/webp-converter"
import { SvgConverter } from "@/components/tools/svg-converter"
import { HeicConverter } from "@/components/tools/heic-converter"
import { IcoGenerator } from "@/components/tools/ico-generator"
import { QrGenerator } from "@/components/tools/qr-generator"
import { BarcodeGenerator } from "@/components/tools/barcode-generator"
import { WatermarkImage } from "@/components/tools/watermark-image"
import { MemeGenerator } from "@/components/tools/meme-generator"
import { ScreenshotEditor } from "@/components/tools/screenshot-editor"
import { CollageMaker } from "@/components/tools/collage-maker"
import { MarkdownEditor } from "@/components/tools/markdown-editor"
import { TextCompare } from "@/components/tools/text-compare"
import { WordCounter } from "@/components/tools/word-counter"
import { CaseConverter } from "@/components/tools/case-converter"
import { JsonToCsv } from "@/components/tools/json-to-csv"
import { CsvToJson } from "@/components/tools/csv-to-json"
import { TextCleaner } from "@/components/tools/text-cleaner"
import { YamlFormatter } from "@/components/tools/yaml-formatter"
import { XmlFormatter } from "@/components/tools/xml-formatter"
import { FindDuplicates } from "@/components/tools/find-duplicates"
import { RemoveBlankLines } from "@/components/tools/remove-blank-lines"
import { RichTextEditor } from "@/components/tools/rich-text-editor"
import { Base64Encode } from "@/components/tools/base64-encode"
import { Base64Decode } from "@/components/tools/base64-decode"
import { JwtDecoder } from "@/components/tools/jwt-decoder"
import { UuidGenerator } from "@/components/tools/uuid-generator"
import { HashGenerator } from "@/components/tools/hash-generator"
import { RegexTester } from "@/components/tools/regex-tester"
import { UrlEncoder } from "@/components/tools/url-encoder"
import { JsonFormatter } from "@/components/tools/json-formatter"
import { SqlFormatter } from "@/components/tools/sql-formatter"
import { LoremIpsum } from "@/components/tools/lorem-ipsum"
import { PasswordGenerator } from "@/components/tools/password-generator"
import { TimestampConverter } from "@/components/tools/timestamp-converter"
import { DiffChecker } from "@/components/tools/diff-checker"
import { ColorPicker } from "@/components/tools/color-picker"
import { CharacterCounter } from "@/components/tools/character-counter"
import { HtmlEncoder } from "@/components/tools/html-encoder"
import { MinifyHtml } from "@/components/tools/minify-html"
import { MinifyCss } from "@/components/tools/minify-css"
import { MinifyJs } from "@/components/tools/minify-js"
import { Beautify } from "@/components/tools/beautify"
import { UrlDecoder } from "@/components/tools/url-decoder"
import { JwtGenerator } from "@/components/tools/jwt-generator"
import { RandomGenerator } from "@/components/tools/random-generator"
import { SlugGenerator } from "@/components/tools/slug-generator"
import { GradientGenerator } from "@/components/tools/gradient-generator"
import { CssGenerator } from "@/components/tools/css-generator"
import { CronGenerator } from "@/components/tools/cron-generator"
import { ApiTester } from "@/components/tools/api-tester"
import { CurlGenerator } from "@/components/tools/curl-generator"
import { VideoCompressor } from "@/components/tools/video-compressor"
import { TrimVideo } from "@/components/tools/trim-video"
import { MergeVideos } from "@/components/tools/merge-videos"
import { ExtractAudio } from "@/components/tools/extract-audio"
import { VideoToGif } from "@/components/tools/video-to-gif"
import { GifToMp4 } from "@/components/tools/gif-to-mp4"
import { AddWatermarkVideo } from "@/components/tools/add-watermark-video"
import { MuteVideo } from "@/components/tools/mute-video"
import { RotateVideo } from "@/components/tools/rotate-video"
import { ResizeVideo } from "@/components/tools/resize-video"
import { Mp3Converter } from "@/components/tools/mp3-converter"
import { AudioCutter } from "@/components/tools/audio-cutter"
import { MergeAudio } from "@/components/tools/merge-audio"
import { VolumeBooster } from "@/components/tools/volume-booster"
import { NoiseRemover } from "@/components/tools/noise-remover"
import { VoiceRecorder } from "@/components/tools/voice-recorder"
import { InvoiceGenerator } from "@/components/tools/invoice-generator"
import { QuotationGenerator } from "@/components/tools/quotation-generator"
import { ReceiptGenerator } from "@/components/tools/receipt-generator"
import { ResumeBuilder } from "@/components/tools/resume-builder"
import { CvBuilder } from "@/components/tools/cv-builder"
import { CoverLetterBuilder } from "@/components/tools/cover-letter-builder"
import { BusinessCardMaker } from "@/components/tools/business-card-maker"
import { EmailSignature } from "@/components/tools/email-signature"
import { QrBusinessCard } from "@/components/tools/qr-business-card"
import { IdCardGenerator } from "@/components/tools/id-card-generator"
import { CertificateGenerator } from "@/components/tools/certificate-generator"
import { PayslipGenerator } from "@/components/tools/payslip-generator"
import { LetterGenerator } from "@/components/tools/letter-generator"
import { ExcelViewer } from "@/components/tools/excel-viewer"
import { WordViewer } from "@/components/tools/word-viewer"
import { PptViewer } from "@/components/tools/ppt-viewer"
import { SpreadsheetEditor } from "@/components/tools/spreadsheet-editor"
import { PresentationViewer } from "@/components/tools/presentation-viewer"
import { Calendar } from "@/components/tools/calendar"
import { Notes } from "@/components/tools/notes"
import { TaskManager } from "@/components/tools/task-manager"
import { Todo } from "@/components/tools/todo"
import { Pomodoro } from "@/components/tools/pomodoro"
import { Calculator } from "@/components/tools/calculator"
import { UnitConverter } from "@/components/tools/unit-converter"
import { CurrencyConverter } from "@/components/tools/currency-converter"
import { TimezoneConverter } from "@/components/tools/timezone-converter"
import { AgeCalculator } from "@/components/tools/age-calculator"
import { EmiCalculator } from "@/components/tools/emi-calculator"
import { PercentageCalculator } from "@/components/tools/percentage-calculator"
import { GstCalculator } from "@/components/tools/gst-calculator"
import { BmiCalculator } from "@/components/tools/bmi-calculator"
import { ScientificCalculator } from "@/components/tools/scientific-calculator"
import { AiChat } from "@/components/tools/ai-chat"
import { AiWriter } from "@/components/tools/ai-writer"
import { AiSummarizer } from "@/components/tools/ai-summarizer"
import { GrammarFixer } from "@/components/tools/grammar-fixer"
import { Paraphraser } from "@/components/tools/paraphraser"
import { Translator } from "@/components/tools/translator"
import { EmailWriter } from "@/components/tools/email-writer"
import { BlogWriter } from "@/components/tools/blog-writer"
import { CodeGenerator } from "@/components/tools/code-generator"
import { CodeExplainer } from "@/components/tools/code-explainer"
import { BugFixer } from "@/components/tools/bug-fixer"
import { PromptGenerator } from "@/components/tools/prompt-generator"
import { PromptImprover } from "@/components/tools/prompt-improver"
import { ResumeAi } from "@/components/tools/resume-ai"
import { CoverLetterAi } from "@/components/tools/cover-letter-ai"
import { MeetingNotes } from "@/components/tools/meeting-notes"
import { SpeechToText } from "@/components/tools/speech-to-text"
import { TextToSpeech } from "@/components/tools/text-to-speech"
import { OcrAi } from "@/components/tools/ocr-ai"
import { PasswordChecker } from "@/components/tools/password-checker"
import { PasswordGeneratorSec } from "@/components/tools/password-generator-sec"
import { FileEncrypt } from "@/components/tools/file-encrypt"
import { FileDecrypt } from "@/components/tools/file-decrypt"
import { SecureNotes } from "@/components/tools/secure-notes"
import { OTPGenerator as OtpGenerator } from "@/components/tools/otp-generator"
import { SecretGenerator } from "@/components/tools/secret-generator"
import { QRScanner as QrScanner } from "@/components/tools/qr-scanner"
import { FileConverter } from "@/components/tools/file-converter"
import { ZipExtractor } from "@/components/tools/zip-extractor"
import { ZipCreator } from "@/components/tools/zip-creator"
import { RenameFiles } from "@/components/tools/rename-files"
import { DuplicateFinder } from "@/components/tools/duplicate-finder"
import { ClipboardManager } from "@/components/tools/clipboard-manager"
import { FilePreview } from "@/components/tools/file-preview"
import { DownloadManager } from "@/components/tools/download-manager"

const toolComponentMap: Record<string, React.ComponentType<{ tool: Tool }>> = {
  "pdf-to-word": PdfToWord,
  "word-to-pdf": WordToPdf,
  "pdf-to-excel": PdfToExcel,
  "excel-to-pdf": ExcelToPdf,
  "pdf-to-ppt": PdfToPpt,
  "ppt-to-pdf": PptToPdf,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "compress-pdf": CompressPdf,
  "rotate-pdf": RotatePdf,
  "unlock-pdf": UnlockPdf,
  "lock-pdf": LockPdf,
  "watermark-pdf": WatermarkPdf,
  "sign-pdf": SignPdf,
  "ocr-pdf": OcrPdf,
  "extract-images-pdf": ExtractImagesPdf,
  "extract-text-pdf": ExtractTextPdf,
  "delete-pages": DeletePages,
  "reorder-pages": ReorderPages,
  "crop-pdf": CropPdf,
  "images-to-pdf": ImagesToPdf,
  "html-to-pdf": HtmlToPdf,
  "pdf-to-jpg": PdfToJpg,
  "jpg-to-pdf": JpgToPdf,
  "background-remover": BackgroundRemover,
  "image-compressor": ImageCompressor,
  "image-upscaler": ImageUpscaler,
  "resize-image": ResizeImage,
  "crop-image": CropImage,
  "rotate-image": RotateImage,
  "flip-image": FlipImage,
  "blur-background": BlurBackground,
  "ai-enhance": AiEnhance,
  "image-to-png": ImageToPng,
  "png-to-jpg": PngToJpg,
  "jpg-to-webp": JpgToWebp,
  "webp-converter": WebpConverter,
  "svg-converter": SvgConverter,
  "heic-converter": HeicConverter,
  "ico-generator": IcoGenerator,
  "qr-generator": QrGenerator,
  "barcode-generator": BarcodeGenerator,
  "watermark-image": WatermarkImage,
  "meme-generator": MemeGenerator,
  "screenshot-editor": ScreenshotEditor,
  "collage-maker": CollageMaker,
  "markdown-editor": MarkdownEditor,
  "rich-text-editor": RichTextEditor,
  "text-compare": TextCompare,
  "word-counter": WordCounter,
  "case-converter": CaseConverter,
  "json-to-csv": JsonToCsv,
  "csv-to-json": CsvToJson,
  "text-cleaner": TextCleaner,
  "yaml-formatter": YamlFormatter,
  "xml-formatter": XmlFormatter,
  "find-duplicates": FindDuplicates,
  "remove-blank-lines": RemoveBlankLines,
  "json-formatter": JsonFormatter,
  "csv-viewer": SpreadsheetEditor,
  "base64-encode": Base64Encode,
  "base64-decode": Base64Decode,
  "jwt-decoder": JwtDecoder,
  "uuid-generator": UuidGenerator,
  "hash-generator": HashGenerator,
  "regex-tester": RegexTester,
  "url-encoder": UrlEncoder,
  "sql-formatter": SqlFormatter,
  "lorem-ipsum": LoremIpsum,
  "password-generator": PasswordGenerator,
  "timestamp-converter": TimestampConverter,
  "diff-checker": DiffChecker,
  "color-picker": ColorPicker,
  "curl-generator": CurlGenerator,
  "character-counter": CharacterCounter,
  "html-encoder": HtmlEncoder,
  "html-decoder": HtmlEncoder,
  "minify-html": MinifyHtml,
  "minify-css": MinifyCss,
  "minify-js": MinifyJs,
  "beautify": Beautify,
  "url-decoder": UrlDecoder,
  "jwt-generator": JwtGenerator,
  "random-generator": RandomGenerator,
  "slug-generator": SlugGenerator,
  "gradient-generator": GradientGenerator,
  "css-generator": CssGenerator,
  "cron-generator": CronGenerator,
  "api-tester": ApiTester,
  "video-compressor": VideoCompressor,
  "trim-video": TrimVideo,
  "merge-videos": MergeVideos,
  "extract-audio": ExtractAudio,
  "video-to-gif": VideoToGif,
  "gif-to-mp4": GifToMp4,
  "add-watermark-video": AddWatermarkVideo,
  "mute-video": MuteVideo,
  "rotate-video": RotateVideo,
  "resize-video": ResizeVideo,
  "mp3-converter": Mp3Converter,
  "audio-cutter": AudioCutter,
  "merge-audio": MergeAudio,
  "volume-booster": VolumeBooster,
  "noise-remover": NoiseRemover,
  "voice-recorder": VoiceRecorder,
  "invoice-generator": InvoiceGenerator,
  "quotation-generator": QuotationGenerator,
  "receipt-generator": ReceiptGenerator,
  "resume-builder": ResumeBuilder,
  "cv-builder": CvBuilder,
  "cover-letter-builder": CoverLetterBuilder,
  "business-card-maker": BusinessCardMaker,
  "email-signature": EmailSignature,
  "qr-business-card": QrBusinessCard,
  "id-card-generator": IdCardGenerator,
  "certificate-generator": CertificateGenerator,
  "payslip-generator": PayslipGenerator,
  "letter-generator": LetterGenerator,
  "excel-viewer": ExcelViewer,
  "word-viewer": WordViewer,
  "ppt-viewer": PptViewer,
  "spreadsheet-editor": SpreadsheetEditor,
  "presentation-viewer": PresentationViewer,
  "calendar": Calendar,
  "notes": Notes,
  "task-manager": TaskManager,
  "todo": Todo,
  "pomodoro": Pomodoro,
  "calculator": Calculator,
  "unit-converter": UnitConverter,
  "currency-converter": CurrencyConverter,
  "timezone-converter": TimezoneConverter,
  "age-calculator": AgeCalculator,
  "emi-calculator": EmiCalculator,
  "percentage-calculator": PercentageCalculator,
  "gst-calculator": GstCalculator,
  "bmi-calculator": BmiCalculator,
  "scientific-calculator": ScientificCalculator,
  "ai-chat": AiChat,
  "ai-writer": AiWriter,
  "ai-summarizer": AiSummarizer,
  "grammar-fixer": GrammarFixer,
  "paraphraser": Paraphraser,
  "translator": Translator,
  "email-writer": EmailWriter,
  "blog-writer": BlogWriter,
  "code-generator": CodeGenerator,
  "code-explainer": CodeExplainer,
  "bug-fixer": BugFixer,
  "prompt-generator": PromptGenerator,
  "prompt-improver": PromptImprover,
  "resume-ai": ResumeAi,
  "cover-letter-ai": CoverLetterAi,
  "meeting-notes": MeetingNotes,
  "speech-to-text": SpeechToText,
  "text-to-speech": TextToSpeech,
  "ocr-ai": OcrAi,
  "password-checker": PasswordChecker,
  "password-generator-sec": PasswordGeneratorSec,
  "file-encrypt": FileEncrypt,
  "file-decrypt": FileDecrypt,
  "secure-notes": SecureNotes,
  "otp-generator": OtpGenerator,
  "secret-generator": SecretGenerator,
  "qr-scanner": QrScanner,
  "file-converter": FileConverter,
  "zip-extractor": ZipExtractor,
  "zip-creator": ZipCreator,
  "rename-files": RenameFiles,
  "duplicate-finder": DuplicateFinder,
  "clipboard-manager": ClipboardManager,
  "file-preview": FilePreview,
  "download-manager": DownloadManager,
}

const GenericToolComponent = Base64Encode

export default function ToolPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const addRecent = useToolStore((s) => s.addRecent)

  const tool = React.useMemo(() => getToolBySlug(slug), [slug])

  React.useEffect(() => {
    if (tool) {
      addRecent(tool.id)
      document.title = `${tool.name} - Office Toolkit Pro`
    }
  }, [tool, addRecent])

  if (!tool) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <EmptyState
            icon={<FileQuestion className="h-10 w-10 text-primary/60" />}
            title="Tool not found"
            description={`No tool matches the slug "${slug}". It may have been moved or doesn't exist.`}
            action={
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/tools")}
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Browse Tools
                </Button>
                <Button variant="primary" onClick={() => router.push("/")}>
                  Go Home
                </Button>
              </div>
            }
          />
        </motion.div>
      </div>
    )
  }

  const ToolComponent = toolComponentMap[slug] || GenericToolComponent

  return <ToolComponent tool={tool} />
}
