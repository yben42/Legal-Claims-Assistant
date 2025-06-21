import { legalKnowledgeBase, claimAssessmentCriteria } from "./knowledge-base"
import { twMerge } from "tailwind-merge"
import clsx from "clsx"
import type { ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assessClaim(
  accidentType: string,
  accidentDate: string,
  fault: string,
  injuries: string,
  financialLosses: string,
): {
  confidence: "high" | "medium" | "low"
  reasons: string[]
} {
  // Parse the accident date
  let dateOutsideLimitation = false
  try {
    const accidentDateObj = new Date(accidentDate)
    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

    if (accidentDateObj < threeYearsAgo) {
      dateOutsideLimitation = true
    }
  } catch (e) {
    // If date parsing fails, we'll consider it as unclear
  }

  // Check for clear low confidence indicators
  if (dateOutsideLimitation) {
    return {
      confidence: "low",
      reasons: ["Incident occurred more than 3 years ago, outside the standard limitation period"],
    }
  }

  if (
    fault.toLowerCase().includes("my fault") ||
    fault.toLowerCase().includes("i was at fault") ||
    fault.toLowerCase().includes("entirely my fault")
  ) {
    return {
      confidence: "low",
      reasons: ["Claimant admits they were fully at fault"],
    }
  }

  if (!injuries || injuries.toLowerCase().includes("no injury") || injuries.toLowerCase().includes("none")) {
    return {
      confidence: "low",
      reasons: ["No clear injury was sustained, which is a requirement for a personal injury claim"],
    }
  }

  // Check for high confidence indicators
  const clearFault =
    fault.toLowerCase().includes("their fault") ||
    fault.toLowerCase().includes("other party") ||
    fault.toLowerCase().includes("employer") ||
    fault.toLowerCase().includes("company")

  const hasFinancialLosses =
    financialLosses && !financialLosses.toLowerCase().includes("no") && !financialLosses.toLowerCase().includes("none")

  if (!dateOutsideLimitation && clearFault && injuries && hasFinancialLosses) {
    return {
      confidence: "high",
      reasons: [
        "Incident within limitation period",
        "Clear fault by another party",
        "Documented injuries",
        "Financial losses indicated",
      ],
    }
  }

  // Default to medium confidence for complex cases
  return {
    confidence: "medium",
    reasons: ["Case has complex factors that require human review"],
  }
}

export { legalKnowledgeBase, claimAssessmentCriteria }
