# Google AI Studio import instructions

AI Studio's Build interface changes over time, and an arbitrary project ZIP is not guaranteed to be directly importable in every version.

1. Download and extract `student_feedback_sentiment_analysis.zip`.
2. Open https://aistudio.google.com/ and enter **Build** / **Build apps**.
3. If the current interface offers **Import**, **Upload project**, or **Import from GitHub**, follow that on-screen workflow.
4. If no project import option appears, create a new app and paste the prompt below. Use the extracted files as your source of truth; transfer files using whatever code/file workflow your current UI supports.
5. Run the preview and resolve build errors.
6. This project has a separate Python FastAPI backend. AI Studio importing the React frontend does not automatically deploy the Python API. A hosted frontend cannot call your laptop's `127.0.0.1`; deploy the backend to a reachable HTTPS URL and set `VITE_API_BASE_URL` to that URL. Keep secrets server-side.

## Build prompt

Build a polished, responsive React + TypeScript web app named “FeedbackAI — Student Feedback Intelligence Platform”. Use a clean light SaaS design with white and soft-gray surfaces, navy typography, indigo accents, subtle borders, premium cards and responsive navigation. Include Overview dashboard with KPI cards and charts, single-feedback analysis, CSV batch preview/export, model evaluation checklist, saved session analyses, and settings. Use the supplied project files as the source of truth if file import is available. Connect to FastAPI `POST /api/predict` when configured. Clearly label keyword-based demo predictions and sample dashboard metrics as illustrative; never invent model accuracy. Keep API keys out of frontend code. Run the preview and fix compile errors.

## If using GitHub
You can extract the ZIP, create a repository and upload the files with Git/GitHub's supported workflow. Only use a GitHub import in AI Studio if the current interface explicitly provides it.
