export const legalKnowledgeBase = `
# UK Personal Injury Law Knowledge Base

## Core Principles of Negligence

1. **Duty of Care**: The defendant owed the claimant a duty of care
   - Employers owe employees a duty to provide a safe working environment
   - Road users owe other road users a duty of care
   - Medical professionals owe patients a duty of care
   - Occupiers owe lawful visitors a duty under the Occupiers' Liability Act 1957

2. **Breach of Duty**: The defendant breached that duty
   - The defendant failed to meet the standard of care expected
   - The standard is that of a reasonable person in the defendant's position

3. **Causation**: The breach caused the claimant's injury
   - "But for" test: But for the defendant's breach, would the injury have occurred?
   - The injury must be a reasonably foreseeable consequence of the breach

4. **Damages**: The claimant suffered injury or loss
   - Physical injuries
   - Psychological injuries
   - Financial losses (special damages)

## Limitation Periods (Limitation Act 1980)

- Standard limitation period for personal injury claims: 3 years
- The period runs from either:
  - The date of the accident/incident, OR
  - The date of knowledge (when the claimant first knew they had a significant injury and who was responsible)
- Exceptions:
  - Children: limitation period does not start until they turn 18
  - Mental capacity: limitation period does not run while the claimant lacks mental capacity
  - Court discretion: courts may disapply the limitation period in exceptional circumstances

## Types of Personal Injury Claims

### Road Traffic Accidents
- Involves collisions between vehicles, pedestrians, cyclists
- Common injuries: whiplash, fractures, head injuries
- Evidence needed: police reports, witness statements, CCTV footage

### Workplace Accidents
- Governed by Health and Safety at Work Act 1974 and related regulations
- Employer's duty to provide safe equipment, training, and working environment
- Common claims: falls from height, manual handling injuries, machinery accidents

### Medical Negligence
- Higher threshold for proving breach of duty
- Bolam test: practice must be supported by a responsible body of medical opinion
- Common claims: surgical errors, misdiagnosis, birth injuries

### Slips, Trips and Falls
- Often involve Occupiers' Liability Acts 1957 and 1984
- Need to prove the occupier failed to take reasonable care
- Common defenses: adequate warning signs, regular inspection systems

## Contributory Negligence

- Claimant's own actions contributed to their injury
- Results in percentage reduction of damages
- Common examples: not wearing seatbelt, ignoring safety instructions

## Claim Valuation Principles

- General damages: for pain, suffering, and loss of amenity
- Special damages: for financial losses (medical expenses, lost earnings)
- Future losses: calculated with multipliers based on life expectancy
- Judicial College Guidelines provide brackets for valuing injuries

## Pre-Action Protocol

- Letter of claim must be sent before court proceedings
- Defendant has 21 days to acknowledge and 3 months to investigate
- Aim is to settle claims without litigation where possible
`

export const claimAssessmentCriteria = {
  highConfidence: [
    "Incident occurred within the last 3 years",
    "Clear fault by another party",
    "Documented injuries",
    "Financial losses can be proven",
    "All elements of negligence are present",
  ],

  lowConfidence: [
    "Incident occurred more than 3 years ago",
    "Claimant admits full fault",
    "No clear injury sustained",
    "No financial losses",
    "Missing elements of negligence",
  ],

  mediumConfidence: [
    "Limitation period approaching or slightly exceeded",
    "Shared or unclear fault",
    "Complex causation issues",
    "Unusual or complex injuries",
    "Novel legal questions",
  ],
}
