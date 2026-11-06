const container = document.getElementById('terminal-lines');
const cursor = document.getElementById('terminal-cursor');
const terminalBody = document.getElementById('terminal-body');
if (!container || !cursor) throw new Error('Terminal elements not found');

const PROMPT =
  '<span class="text-emerald-400">user@k8s</span><span class="text-zinc-500">:</span><span class="text-blue-400">~/charts</span><span class="text-zinc-500"> $</span> ';
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

interface Step {
  type: 'command' | 'output' | 'spinner' | 'pause';
  text?: string;
  class?: string;
  duration?: number;
  lines?: { text: string; class?: string }[];
}

const SCENARIO: Step[] = [
  { type: 'command', text: 'helm repo add helmforge https://repo.helmforge.dev' },
  { type: 'output', text: '"helmforge" has been added to your repositories', class: 'text-zinc-500' },
  { type: 'pause', duration: 600 },

  { type: 'command', text: 'helm install db helmforge/postgresql --namespace production' },
  { type: 'spinner', text: 'Installing chart...', duration: 2000 },
  {
    type: 'output',
    lines: [
      { text: 'NAME: db', class: 'text-zinc-400' },
      { text: 'NAMESPACE: production', class: 'text-zinc-400' },
      { text: 'STATUS: deployed', class: 'text-emerald-400 font-semibold' },
      { text: 'REVISION: 1', class: 'text-zinc-400' },
    ],
  },
  { type: 'pause', duration: 800 },
  {
    type: 'output',
    lines: [
      { text: '✓ PostgreSQL 17.4 deployed with secure defaults', class: 'text-emerald-400' },
      { text: '✓ S3 backup CronJob configured (daily 02:00)', class: 'text-emerald-400' },
      { text: '✓ NetworkPolicy applied', class: 'text-emerald-400' },
      { text: '✓ Secrets generated and mounted', class: 'text-emerald-400' },
    ],
  },
  { type: 'pause', duration: 1000 },

  { type: 'command', text: 'kubectl get pods -n production' },
  {
    type: 'output',
    lines: [
      { text: 'NAME                     READY   STATUS    RESTARTS   AGE', class: 'text-zinc-500 font-semibold' },
      { text: 'db-postgresql-0          1/1     Running   0          42s', class: 'text-zinc-300' },
    ],
  },
  { type: 'pause', duration: 1500 },
  { type: 'output', text: '🚀 Happy forging!', class: 'text-white font-semibold' },
  { type: 'pause', duration: 4000 },
];

function scrollToBottom() {
  if (terminalBody) {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }
}

function createLine(): HTMLDivElement {
  const line = document.createElement('div');
  line.className = 'whitespace-pre-wrap break-words';
  container.appendChild(line);
  scrollToBottom();
  return line;
}

function showCursor() {
  cursor.classList.remove('hidden');
}

function hideCursor() {
  cursor.classList.add('hidden');
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function typeText(line: HTMLDivElement, prefix: string, text: string): Promise<void> {
  line.innerHTML = prefix;
  showCursor();
  // Move cursor next to last character
  line.appendChild(cursor);

  for (let i = 0; i < text.length; i++) {
    const speed = 25 + Math.random() * 35;
    await sleep(speed);
    // Insert character before cursor
    const span = document.createTextNode(text[i]);
    line.insertBefore(span, cursor);
    scrollToBottom();
  }
  hideCursor();
}

async function showSpinner(text: string, duration: number): Promise<HTMLDivElement> {
  const line = createLine();
  const start = Date.now();
  let frame = 0;

  while (Date.now() - start < duration) {
    line.innerHTML = `<span class="text-amber-400">${SPINNER_FRAMES[frame % SPINNER_FRAMES.length]}</span> <span class="text-zinc-400">${text}</span>`;
    frame++;
    await sleep(80);
  }
  // Remove spinner line
  line.remove();
  return line;
}

async function outputLines(lines: { text: string; class?: string }[]): Promise<void> {
  for (const l of lines) {
    const line = createLine();
    line.innerHTML = `<span class="${l.class ?? 'text-zinc-300'}">${l.text}</span>`;
    await sleep(50);
  }
}

async function runScenario(): Promise<void> {
  container.innerHTML = '';

  for (const step of SCENARIO) {
    switch (step.type) {
      case 'command': {
        const line = createLine();
        await typeText(line, PROMPT, step.text!);
        await sleep(300);
        break;
      }
      case 'output': {
        if (step.lines) {
          await outputLines(step.lines);
        } else {
          const line = createLine();
          line.innerHTML = `<span class="${step.class ?? 'text-zinc-300'}">${step.text}</span>`;
        }
        break;
      }
      case 'spinner': {
        await showSpinner(step.text!, step.duration!);
        break;
      }
      case 'pause': {
        await sleep(step.duration!);
        break;
      }
    }
  }
}

async function loop(): Promise<void> {
  while (true) {
    await runScenario();
  }
}

// Start when visible
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      loop();
    }
  },
  { threshold: 0.3 },
);

const terminal = document.querySelector('.hero-terminal');
if (terminal) {
  observer.observe(terminal);
}
