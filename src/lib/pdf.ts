'use client';

import { UserData, Scores, getScoreColor } from './types';
import { ProfileType, profileNames, profileDescriptions, calculateMaintenance, calculateBodyFat } from './scoring';
import { restaurantOrders } from './restaurants';
import { getStuckItems, getMorningProtein, getStepSuggestion, getActionItems, getWaterTarget } from './content';
import jsPDF from 'jspdf';

export function generatePDF(data: UserData, scores: Scores, profile: ProfileType) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const name = data.name || 'Friend';
  const maintenance = calculateMaintenance(data);
  const bodyFat = calculateBodyFat(data.weight, data.heightFt, data.heightIn, data.age);
  const goalBodyFat = calculateBodyFat(data.goalWeight, data.heightFt, data.heightIn, data.age);
  const weightDiff = data.weight - data.goalWeight;

  const gold: [number, number, number] = [200, 169, 81];
  const white: [number, number, number] = [255, 255, 255];
  const gray: [number, number, number] = [136, 136, 136];
  const bg: [number, number, number] = [0, 0, 0];
  const card: [number, number, number] = [20, 20, 20];

  function addBlackPage() {
    doc.setFillColor(...bg);
    doc.rect(0, 0, w, 297, 'F');
  }

  function drawGoldLine(y: number) {
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(20, y, w - 20, y);
  }

  function drawPillCard(x: number, y: number, width: number, height: number) {
    doc.setFillColor(...card);
    doc.roundedRect(x, y, width, height, 4, 4, 'F');
    doc.setDrawColor(40, 40, 40);
    doc.roundedRect(x, y, width, height, 4, 4, 'S');
  }

  // ========== PAGE 1 — COVER ==========
  addBlackPage();
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(36);
  doc.text('RIVEN', w / 2, 80, { align: 'center' });
  doc.setFontSize(14);
  doc.text('YOUR RESET RESULTS', w / 2, 95, { align: 'center' });
  drawGoldLine(105);
  doc.setTextColor(...white);
  doc.setFontSize(18);
  doc.text(`Prepared for ${name}`, w / 2, 125, { align: 'center' });
  doc.setTextColor(...gray);
  doc.setFontSize(12);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), w / 2, 138, { align: 'center' });

  // ========== PAGE 2 — SNAPSHOT ==========
  doc.addPage();
  addBlackPage();
  let y = 25;
  doc.setTextColor(...gold);
  doc.setFontSize(20);
  doc.text(`${name}'s Snapshot`, 20, y);
  y += 15;

  doc.setTextColor(...white);
  doc.setFontSize(11);
  const lines2 = [
    `Current: ${data.weight} lbs  >  Goal: ${data.goalWeight} lbs  (${weightDiff} lbs to lose)`,
    `Maintenance Calories: ${maintenance.toLocaleString()} cal/day`,
    `Estimated Body Fat: ${bodyFat}%  >  Target: ${goalBodyFat}%`,
  ];
  lines2.forEach(l => { doc.text(l, 20, y); y += 8; });

  y += 5;
  drawGoldLine(y);
  y += 12;

  doc.setTextColor(...gold);
  doc.setFontSize(16);
  doc.text('Your Profile Type', 20, y);
  y += 10;
  doc.setFontSize(22);
  doc.text(profileNames[profile], 20, y);
  y += 10;
  doc.setTextColor(...white);
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(profileDescriptions[profile], w - 40);
  doc.text(descLines, 20, y);
  y += descLines.length * 5 + 10;

  drawGoldLine(y);
  y += 12;

  doc.setTextColor(...gold);
  doc.setFontSize(16);
  doc.text(`Your RIVEN Score: ${scores.total}/60`, 20, y);
  y += 12;

  const categories: [string, number][] = [
    ['Morning Protein', scores.morningProtein],
    ['Blood Sugar', scores.bloodSugar],
    ['Hydration', scores.hydration],
    ['Movement', scores.movement],
    ['Eliminations', scores.eliminations],
    ['Accountability', scores.accountability],
  ];

  categories.forEach(([label, score]) => {
    const c = getScoreColor(score);
    const hex = c.hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    doc.setFillColor(r, g, b);
    doc.circle(25, y - 2, 3, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.text(`${label}: ${score}/10`, 32, y);
    y += 8;
  });

  // ========== PAGE 3 — WHAT'S KEEPING YOU STUCK (pill cards) ==========
  doc.addPage();
  addBlackPage();
  y = 25;
  doc.setTextColor(...gold);
  doc.setFontSize(20);
  doc.text("What's Keeping You Stuck", 20, y);
  y += 15;

  const stuckItems = getStuckItems(data, scores);
  stuckItems.forEach((item, i) => {
    if (y > 255) {
      doc.addPage();
      addBlackPage();
      y = 25;
    }
    const bodyLines = doc.splitTextToSize(item.body, w - 60);
    const cardH = 10 + bodyLines.length * 4.5 + 6;

    drawPillCard(20, y, w - 40, cardH);

    doc.setTextColor(...gold);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${String(i + 1).padStart(2, '0')}  ${item.title}`, 26, y + 7);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(bodyLines, 26, y + 13);

    y += cardH + 5;
  });

  // ========== PAGE 4 — PHASE 1 PLAN ==========
  doc.addPage();
  addBlackPage();
  y = 25;
  doc.setTextColor(...gold);
  doc.setFontSize(20);
  doc.text('Your Phase 1 Plan', 20, y);
  y += 15;

  // Morning Protocol pill
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.text('MORNING PROTOCOL', 20, y);
  y += 7;
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.text('30g Protein Before 9AM — Under 400 cal.', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  const mpLines = doc.splitTextToSize(getMorningProtein(profile), w - 40);
  doc.text(mpLines, 20, y);
  y += mpLines.length * 4.5 + 10;

  // Restaurant Guide
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.text('DINING OUT GUIDE', 20, y);
  y += 8;

  data.restaurants.forEach(r => {
    const order = restaurantOrders[r];
    if (!order) return;
    if (y > 255) { doc.addPage(); addBlackPage(); y = 25; }

    const oLines = doc.splitTextToSize(order.order, w - 70);
    const ch = 8 + oLines.length * 4;
    drawPillCard(20, y, w - 40, ch);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...gold);
    doc.setFontSize(10);
    doc.text(order.name, 26, y + 6);

    doc.setTextColor(...white);
    doc.setFontSize(8);
    doc.text(`${order.calories} cal | ${order.protein}g protein`, w - 26, y + 6, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text(oLines, 26, y + 12);

    y += ch + 4;
  });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.text('STEP TARGET: 7,000 STEPS DAILY', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  const stepLines = doc.splitTextToSize(getStepSuggestion(data), w - 40);
  doc.text(stepLines, 20, y);
  y += stepLines.length * 5 + 10;

  // ========== PAGE 5 — WEEKLY BLUEPRINT ==========
  doc.addPage();
  addBlackPage();
  y = 25;
  doc.setTextColor(...gold);
  doc.setFontSize(20);
  doc.text('Your Weekly Blueprint', 20, y);
  y += 15;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.text('YOUR WEEK ON PHASE 1', 20, y);
  y += 10;

  const waterTarget = getWaterTarget(data);
  const weekItems = [
    `Every morning: Your assigned protein option before 10 AM`,
    `Lunch: No changes. Eat what you normally eat.`,
    `Dinner: No changes. Eat protein first on the plate.`,
    `Daily: 7,000 steps. ${getStepSuggestion(data)}`,
    `Water: Target ${waterTarget} per day`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  weekItems.forEach(item => {
    const iLines = doc.splitTextToSize(`  ${item}`, w - 40);
    doc.text(iLines, 20, y);
    y += iLines.length * 5 + 3;
  });

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(13);
  doc.text('YOUR 3 ACTION ITEMS THIS WEEK', 20, y);
  y += 10;

  const actions = getActionItems(data, scores);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  actions.forEach((item, i) => {
    const aLines = doc.splitTextToSize(`${i + 1}. ${item}`, w - 40);
    doc.text(aLines, 20, y);
    y += aLines.length * 5 + 5;
  });

  y += 10;
  drawGoldLine(y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(14);
  doc.text("WHAT'S NEXT", 20, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  const nextText = "You have your Phase 1 plan. You can start tomorrow. But if you want somebody checking on you every day, coaching you through the hard weeks, and making sure you don't fall off — there's a community of women doing this together.";
  const nLines = doc.splitTextToSize(nextText, w - 40);
  doc.text(nLines, 20, y);
  y += nLines.length * 5 + 10;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gold);
  doc.setFontSize(16);
  doc.text('RIVEN Community — $100/month', w / 2, y, { align: 'center' });
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.text('Weekly coaching calls. Daily step accountability. Restaurant guides.', w / 2, y, { align: 'center' });
  y += 6;
  doc.text('7-day free trial. Cancel anytime.', w / 2, y, { align: 'center' });
  y += 10;
  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.textWithLink('Join RIVEN: skool.com/riven-community-5552', w / 2, y, {
    url: 'https://www.skool.com/riven-community-5552/about',
    align: 'center',
  });

  return doc;
}
