// Centralised Claude model selection for the MonoKromatik agent pipeline.
//
// Fable 5 (`claude-fable-5`) is Anthropic's most capable text + vision model and
// serves as the generation/editorial *brain* here. Important: Fable 5 — like all
// Claude models — generates text and reasons over images, but does NOT generate
// images or video. Rich media is pulled from reputable references via the media
// sourcing layer (lib/source-image.ts) and the AttributedMedia / OfficialVideoEmbed
// components, not produced by the model.
//
// Fable 5 request surface (see the claude-api skill): adaptive thinking only;
// `temperature` / `top_p` / `top_k` / `budget_tokens` are removed (sending them
// 400s). All pipeline calls here are already param-clean.
//
// Every tier is overridable via env so the model mix can be tuned without a deploy.

export const MODELS = {
  /** Flagship long-form generation + editorial judgement (article writing, EIC review). */
  flagship: process.env.MONO_MODEL_FLAGSHIP || 'claude-fable-5',
  /** Brand-voice styling and medium-weight editorial tasks. */
  editorial: process.env.MONO_MODEL_EDITORIAL || 'claude-sonnet-4-6',
  /** High-volume mechanical tasks (curation, dedupe, classification, social snippets). */
  utility: process.env.MONO_MODEL_UTILITY || 'claude-haiku-4-5',
} as const;
