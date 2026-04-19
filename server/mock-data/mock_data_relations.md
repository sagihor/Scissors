Barbershops ans owners:

Owner Roni Hadad (u_owner_001)
    └── owns → Classic Cuts Tel Aviv (bs_001)
               ├── employs → David Perez (u_barber_001)
               └── employs → Moshe Ohayon (u_barber_002)

Owner Itai Malka (u_owner_002)
    ├── owns → Urban Barber (bs_002)
    │           ├── employs → Eitan Shapira (u_barber_003)
    │           └── employs → Omer Dahan (u_barber_004)
    └── owns → Quick Snip (bs_004)         ← אותו בעלים, 2 עסקים!

Owner Gadi Peretz (u_owner_003)
    └── owns → The Gentleman (bs_003)
               └── employs → Yaron Azulay (u_barber_005)


services: 

Classic Cuts (bs_001):
    sv_001 Classic Haircut    80₪
    sv_002 Skin Fade         100₪
    sv_003 Beard Trim         50₪
    sv_004 Haircut + Beard   120₪

Urban Barber (bs_002):
    sv_005 Modern Cut        110₪
    sv_006 Beard Sculpting    70₪
    sv_007 Cut + Beard Premium 160₪
    sv_008 Kid's Cut          60₪

The Gentleman (bs_003):
    sv_009 The Gentleman's Cut 150₪
    sv_010 Royal Shave       180₪
    sv_011 Full Experience   350₪

Quick Snip (bs_004):
    sv_012 Quick Cut          50₪
    sv_013 Quick Beard        30₪
    sv_014 Quick Combo        70₪


Clients preferances:

Yossi Cohen (u_cust_001)     preferredBarber → David (u_barber_001) at Classic Cuts
Rachel Levi (u_cust_002)     no preferred — shops around
Avi Mizrahi (u_cust_003)     preferredBarber → Eitan (u_barber_003) at Urban Barber
Shira Ben-David (u_cust_004) no preferred
Daniel Katz (u_cust_005)     preferredBarber → Moshe (u_barber_002) at Classic Cuts
Maya Friedman (u_cust_006)   no preferred


appointments (loyal customers)

Yossi (cust_001) + David (barber_001) at Classic Cuts (bs_001):
    apt_001 [completed]  15.3.26  Classic Haircut
    apt_002 [completed]   5.4.26  Haircut + Beard
    apt_008 [confirmed]  25.4.26  Classic Haircut

    → Yossi הוא "הלקוח הקבוע" של David - 3 תורים ברצף
    → זה מתאים עם preferredBarberId שלו!


appointments (customers trying new places)

Rachel (cust_002):
    apt_003 at Classic Cuts, Moshe     (completed)
    apt_007 at Urban Barber, Eitan     (confirmed)  ← מנסה מקום חדש!
    
    → Rachel אין preferred barber - מתאים להתנהגות שלה


cancelation:
apt_005 [cancelled]: Shira ביטלה את התור שלה 24 שעות מראש
                      Reason: "Work conflict"
                      cancelledBy: "customer"

apt_011 [no_show]: Shira לא הגיעה לתור ביצוב זקן
                    → Shira פספסה תור אחד - מידע חשוב לבעל עסק!



potfolio:

David (barber_001):     3 תמונות - fade, beard, classic
Moshe (barber_002):     2 תמונות - design, color
Eitan (barber_003):     2 תמונות - beard specialist
Omer (barber_004):      2 תמונות - trendy, kids
Yaron (barber_005):     3 תמונות - classic gentleman style



reviews:

rev_001: Yossi → David (5⭐)  about apt_001
rev_002: Yossi → David (5⭐)  about apt_002  ← Yossi אוהב את David!
rev_003: Rachel → Moshe (4⭐) about apt_003
rev_004: Avi → Eitan (5⭐)    about apt_004
rev_005: Daniel → Moshe (4⭐) about apt_006