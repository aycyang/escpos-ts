import sys
import csv
from datetime import datetime
import matplotlib.pyplot as plt

x = []
y = []

with open(sys.argv[1]) as csvfile:
    myreader = csv.reader(csvfile)
    rows = list(myreader)
    rows.sort()
    for row in rows:
        x.append(datetime.fromtimestamp(int(row[0])))
        y.append(int(row[1]))


fig, ax = plt.subplots()
ax.step(x, y)
ax.set_ylim([0, 160])
ax.set_xlim([datetime.fromisoformat('2025-10-21:00:00Z'), datetime.fromisoformat('2026-01-01T00:00:00Z')])
ax.set_ylabel('number of passing tests')
plt.title('ESC/POS commands implemented over time')
plt.xticks(rotation=20)
plt.savefig('progress.png', bbox_inches='tight')
