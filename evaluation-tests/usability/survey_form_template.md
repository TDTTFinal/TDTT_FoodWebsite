# Usability Survey Form Template

## Food Tour Website - User Satisfaction Survey

---

### Participant Information

- **Participant ID:** _______
- **Date:** _______
- **Age Range:** □ 18-25  □ 26-35  □ 36-45  □ 45+
- **Tech Savviness:** □ Beginner  □ Intermediate  □ Advanced

---

### Task Completion

**Did you successfully complete the task?**
- □ Yes, easily
- □ Yes, with some difficulty
- □ No, could not complete

**Time taken:** _____ seconds

---

### Likert Scale Questions (1-5)

**1 = Strongly Disagree, 5 = Strongly Agree**

#### Ease of Use

**1. The website was easy to use**
□ 1  □ 2  □ 3  □ 4  □ 5

**2. I could find what I was looking for quickly**
□ 1  □ 2  □ 3  □ 4  □ 5

**3. The search functionality worked well**
□ 1  □ 2  □ 3  □ 4  □ 5

**4. Adding restaurants to the Food Tour was intuitive**
□ 1  □ 2  □ 3  □ 4  □ 5

**5. The drag-and-drop feature was easy to understand**
□ 1  □ 2  □ 3  □ 4  □ 5

#### Speed & Efficiency

**6. The website responded quickly**
□ 1  □ 2  □ 3  □ 4  □ 5

**7. I could complete my task efficiently**
□ 1  □ 2  □ 3  □ 4  □ 5

**8. The map loaded promptly**
□ 1  □ 2  □ 3  □ 4  □ 5

#### Satisfaction

**9. I am satisfied with the search results**
□ 1  □ 2  □ 3  □ 4  □ 5

**10. The suggested routes were helpful**
□ 1  □ 2  □ 3  □ 4  □ 5

**11. I would use this website again**
□ 1  □ 2  □ 3  □ 4  □ 5

**12. I would recommend this website to others**
□ 1  □ 2  □ 3  □ 4  □ 5

---

### Open-Ended Questions

**What did you like most about the website?**

```
_________________________________________________________________

_________________________________________________________________
```

**What frustrated you the most?**

```
_________________________________________________________________

_________________________________________________________________
```

**What would you improve?**

```
_________________________________________________________________

_________________________________________________________________
```

**Any other comments?**

```
_________________________________________________________________

_________________________________________________________________
```

---

## Scoring

### Calculate Average Scores

**Ease of Use** (Q1-Q5): _____ / 5

**Speed & Efficiency** (Q6-Q8): _____ / 5

**Satisfaction** (Q9-Q12): _____ / 5

**Overall Score**: _____ / 5

---

## Data Storage

### Save results to

`usability/results/survey_responses.csv`

**Format:**
```csv
participant_id,completion_success,time_sec,q1,q2,q3,...,q12,ease_avg,speed_avg,satisfaction_avg,overall_avg
P001,yes,45,5,4,5,...,4,4.6,4.3,4.5,4.5
```

---

## Analysis

### Target Metrics

- **Overall Satisfaction:** > 4.0 / 5
- **Ease of Use:** > 4.2 / 5
- **Completion Rate:** > 90%

### Red Flags

- Any score < 3.0 indicates serious usability issue
- Repeated complaints in open-ended → needs immediate fix

---

## Google Forms Alternative

**If using Google Forms:**

1. Create form with Likert scale questions
2. Share link with participants
3. Export responses to CSV
4. Save to `usability/results/`

**Template URL:** *(Tạo Google Form và paste link ở đây)*
