import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFileSync } from "fs";
import { resolve } from "path";

export async function POST(request: Request) {
  const body = await request.json();
  const { applicationId } = body;

  if (!applicationId) {
    return NextResponse.json({ error: "applicationId required" }, { status: 400 });
  }

  const app = await prisma.jobApplication.findUnique({
    where: { id: applicationId },
    include: { evaluation: true },
  });

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const profile = await prisma.candidateProfile.findFirst();
  if (!profile) {
    return NextResponse.json({ error: "Profile not set up" }, { status: 400 });
  }

  try {
    // Read CV template and fill placeholders
    const templatePath = resolve(process.cwd(), "templates/cv-template.html");
    let html = readFileSync(templatePath, "utf-8");

    // Replace placeholders with profile data
    html = html.replace(/\{\{NAME\}\}/g, profile.fullName);
    html = html.replace(/\{\{LANG\}\}/g, "en");
    html = html.replace(/\{\{EMAIL\}\}/g, profile.email);
    html = html.replace(/\{\{LOCATION\}\}/g, profile.location);
    html = html.replace(/\{\{LINKEDIN_URL\}\}/g, profile.linkedin);
    html = html.replace(/\{\{PORTFOLIO_URL\}\}/g, profile.portfolioUrl);

    // Update font paths for web serving
    html = html.replace(/url\(['"]?\.\/fonts\//g, `url('/fonts/`);

    // Return the filled HTML — client will open in new window for browser print-to-PDF
    await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { hasPdf: true },
    });

    return NextResponse.json({
      success: true,
      html,
      message: "Open the preview and use your browser's Print → Save as PDF to generate the PDF.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
