import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import type { PaymentDetails } from "@/actions/payments/get-payment-details";

type StoreData = {
  name: string;
  cnpj: string | null;
  address: string | null;
};

const CPF_REGEX = /(\d{3})(\d{3})(\d{3})(\d{2})/;
const CNPJ_REGEX = /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatCPF(cpf: string): string {
  return cpf.replace(CPF_REGEX, "$1.$2.$3-$4");
}

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(CNPJ_REGEX, "$1.$2.$3/$4-$5");
}

const UNITS = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];

const TENS = [
  "",
  "dez",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

const TEENS = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const HUNDREDS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function convertTwoDigits(num: number): string {
  if (num < 10) {
    return UNITS[num];
  }
  if (num < 20) {
    return TEENS[num - 10];
  }
  const ten = Math.floor(num / 10);
  const unit = num % 10;
  return TENS[ten] + (unit ? ` e ${UNITS[unit]}` : "");
}

function convertIntegerPart(integerPart: number): string {
  if (integerPart === 0) {
    return "";
  }

  if (integerPart === 100) {
    return "cem";
  }

  if (integerPart < 100) {
    return convertTwoDigits(integerPart);
  }

  if (integerPart < 1000) {
    const hundred = Math.floor(integerPart / 100);
    const remainder = integerPart % 100;
    let result = HUNDREDS[hundred];
    if (remainder > 0) {
      result += ` e ${convertTwoDigits(remainder)}`;
    }
    return result;
  }

  return "";
}

function getRealLabel(integerPart: number): string {
  if (integerPart === 1) {
    return " real";
  }
  return " reais";
}

function convertCentavos(decimalPart: number): string {
  if (decimalPart === 0) {
    return "";
  }

  const centavosWord = convertTwoDigits(decimalPart);
  const centavoLabel = decimalPart === 1 ? " centavo" : " centavos";
  return ` e ${centavosWord}${centavoLabel}`;
}

function numberToWords(value: number): string {
  const integerPart = Math.floor(value);
  const decimalPart = Math.round((value - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return "zero reais";
  }

  const integerWords = convertIntegerPart(integerPart);
  const realLabel = getRealLabel(integerPart);
  const centavosWords = convertCentavos(decimalPart);

  return integerWords + realLabel + centavosWords;
}

export function generatePaymentReceipt(
  payment: PaymentDetails,
  store: StoreData,
  receiptNumber: string
): void {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const tableStartX = margin + 20;
  const tableWidth = pageWidth - (margin + 20) * 2;
  let yPos = 30;

  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(store.name.toUpperCase(), pageWidth / 2, yPos, {
    align: "center",
  });

  yPos += 7;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  if (store.address) {
    pdf.text(store.address, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
  }

  if (store.cnpj) {
    pdf.text(`CNPJ: ${formatCNPJ(store.cnpj)}`, pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 5;
  }

  yPos += 10;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("RECIBO DE PAGAMENTO", pageWidth / 2, yPos, { align: "center" });

  yPos += 7;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nº ${receiptNumber}`, pageWidth / 2, yPos, { align: "center" });

  yPos += 10;
  pdf.setLineWidth(0.5);
  pdf.line(margin + 20, yPos, pageWidth - (margin + 20), yPos);

  yPos += 12;
  pdf.setFontSize(10);
  pdf.text(
    `Recebi de ${store.name.toUpperCase()} a importância de:`,
    margin + 20,
    yPos
  );

  yPos += 10;
  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.text(formatCurrency(payment.netValue), margin + 20, yPos);

  yPos += 7;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  const valueInWords = `(${numberToWords(payment.netValue)})`;
  pdf.text(valueInWords, margin + 20, yPos);

  yPos += 12;
  pdf.setFontSize(10);
  const description = payment.description || "Prestação de serviços";
  pdf.text(`Referente a: ${description}`, margin + 20, yPos);

  yPos += 6;
  const formattedDate = format(new Date(payment.date), "MMMM/yy", {
    locale: ptBR,
  });
  const capitalizedMonth =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  pdf.text(`Período: ${capitalizedMonth}`, margin + 20, yPos);

  yPos += 15;

  const tableHeaderHeight = 8;
  const rowHeight = 7;
  const col1Width = tableWidth * 0.6;
  const col2Width = tableWidth * 0.4;

  pdf.setFillColor(220, 220, 220);
  pdf.rect(tableStartX, yPos, tableWidth, tableHeaderHeight, "F");

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Descrição", tableStartX + 3, yPos + 6);
  pdf.text("Valor", tableStartX + col1Width + 3, yPos + 6);

  yPos += tableHeaderHeight;

  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);

  pdf.rect(tableStartX, yPos, col1Width, rowHeight);
  pdf.rect(tableStartX + col1Width, yPos, col2Width, rowHeight);
  pdf.text("Valor Bruto", tableStartX + 3, yPos + 5);
  pdf.text(
    formatCurrency(payment.grossValue),
    tableStartX + col1Width + 3,
    yPos + 5
  );

  yPos += rowHeight;

  pdf.rect(tableStartX, yPos, col1Width, rowHeight);
  pdf.rect(tableStartX + col1Width, yPos, col2Width, rowHeight);
  pdf.text("Descontos", tableStartX + 3, yPos + 5);
  pdf.text(
    formatCurrency(payment.discounts),
    tableStartX + col1Width + 3,
    yPos + 5
  );

  yPos += rowHeight;

  pdf.setFont("helvetica", "bold");
  pdf.rect(tableStartX, yPos, col1Width, rowHeight);
  pdf.rect(tableStartX + col1Width, yPos, col2Width, rowHeight);
  pdf.text("Valor Líquido", tableStartX + 3, yPos + 5);
  pdf.text(
    formatCurrency(payment.netValue),
    tableStartX + col1Width + 3,
    yPos + 5
  );

  yPos += rowHeight + 18;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Dados do beneficiário:", margin + 20, yPos);

  yPos += 7;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Nome: ${payment.employee.name}`, margin + 20, yPos);

  yPos += 6;
  if (payment.employee.cpf) {
    pdf.text(`CPF: ${formatCPF(payment.employee.cpf)}`, margin + 20, yPos);
    yPos += 6;
  }

  pdf.text(`Função: ${payment.employee.role}`, margin + 20, yPos);

  yPos += 15;
  const receiptDate = format(new Date(payment.date), "dd/MM/yyyy", {
    locale: ptBR,
  });
  pdf.text(`Data: ${receiptDate}`, margin + 20, yPos);

  yPos += 30;
  const signatureLineWidth = 150;
  const signatureLineX = (pageWidth - signatureLineWidth) / 2;
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  pdf.line(signatureLineX, yPos, signatureLineX + signatureLineWidth, yPos);

  yPos += 5;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Assinatura do Beneficiário", pageWidth / 2, yPos, {
    align: "center",
  });

  const fileName = `recibo-${receiptNumber}-${payment.employee.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  pdf.save(fileName);
}
