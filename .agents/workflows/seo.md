---
description: system design
---

1. User enters URL
   → validate + normalize (https, no trailing slash)

2. Check rules
   → block invalid / internal URLs
   → block duplicate (same user + same URL)

3. Check credits
   → if 0 → block + show upgrade
   → if >0 → continue

4. Start analysis
   → fetch HTML
   → parse DOM
   → run SEO rules
   → generate issues
   → calculate score

5. Store result
   → save report (user_id, url, result)

6. Deduct credit
   → only after successful analysis

7. Show report (NO LOGIN REQUIRED)
   → score
   → issues (priority-based)
   → visual preview

8. Gate actions
   → if user clicks:
        - Download PDF
        - Save report
     AND not logged in:
        → redirect to login
        → return back after login

9. Post-login
   → allow export / save