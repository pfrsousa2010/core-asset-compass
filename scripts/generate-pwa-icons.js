const fs = require('fs');
const path = require('path');

// SVG do ícone Package baseado no Lucide React
const packageIconSVG = `
<svg width="512" height="512" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" fill="#2563eb"/>
  <path d="M16.5 9.4 7.55 4.24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M3.27 6.96 12 12.01l8.73-5.05" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 22.08V12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

// Tamanhos dos ícones necessários
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Função para criar ícone PNG (simulada - em produção você usaria uma biblioteca como sharp)
function createIconPNG(size) {
  // Esta é uma versão simplificada. Em produção, você usaria uma biblioteca como sharp
  // para converter SVG para PNG com o tamanho especificado
  console.log(`Gerando ícone ${size}x${size}...`);
  
  // Por enquanto, vamos criar um arquivo placeholder
  const svgContent = packageIconSVG.replace(/width="512" height="512"/, `width="${size}" height="${size}"`);
  
  // Salvar como SVG temporariamente (em produção, converter para PNG)
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(iconPath, svgContent);
  
  console.log(`Ícone criado: ${iconPath}`);
}

// Gerar todos os ícones
console.log('Gerando ícones PWA...');
iconSizes.forEach(size => {
  createIconPNG(size);
});

console.log('Ícones PWA gerados com sucesso!');
console.log('Nota: Para produção, use uma biblioteca como sharp para converter SVG para PNG'); 