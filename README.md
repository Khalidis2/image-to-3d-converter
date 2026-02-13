# 🎨 Image to 3D Converter

Transform your images into professional 3D models ready for Bambu Lab printers!

## ✨ Features

- 🖼️ Upload JPEG/PNG images (up to 20 MB)
- 🤖 AI-powered image-to-3D conversion using Hunyuan3D
- 🎯 Customizable slicing settings (layer height, infill, printer profile)
- 📥 Download print-ready GLB files
- 🖨️ Compatible with Bambu Studio
- ⚡ Lightning-fast processing (~90 seconds)
- 💯 100% FREE

## 🚀 Quick Start

1. **Upload an image** - JPEG or PNG (landscape works best)
2. **Configure slicing** - Choose layer height, infill percentage, printer model
3. **Download model** - Get your GLB file ready to print
4. **Open in Bambu Studio** - Import and start printing!

## 💻 How It Works

1. Frontend: Built with vanilla HTML/CSS/JavaScript
2. 3D Conversion: HuggingFace Spaces (Free GPU)
3. Model: Tencent Hunyuan3D (Professional quality)
4. Hosting: Vercel (Completely free)

## 📊 Supported Printers

- Bambu Lab X1
- Bambu Lab X1 Carbon
- Bambu Lab P1S
- All FDM printers compatible with STL/GLB

## ⚙️ Slicing Presets

**Layer Height:**
- 0.1mm - High Detail
- 0.2mm - Standard (Recommended)
- 0.3mm - Fast

**Infill:**
- 10% - Lightweight
- 15% - Standard (Recommended)
- 20% - Strong
- 30% - Very Strong

## 🔧 Deployment

### Deploy to Vercel (Recommended)

```bash
# 1. Create GitHub account at github.com
# 2. Create new repository
# 3. Clone this project
git clone <repo-url>
cd image-to-3d-converter

# 4. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 5. Go to vercel.com/new
# 6. Import your GitHub repository
# 7. Click Deploy
# 8. Website is live! 🎉
```

Your site will be available at: `https://your-project-name.vercel.app`

## 📝 API Details

- **Provider:** HuggingFace Spaces
- **Model:** Tencent Hunyuan3D 2.1
- **Processing Time:** 60-120 seconds
- **Output Format:** GLB (ready for 3D printing)
- **Cost:** FREE (HuggingFace provides free GPU time)

## 🎯 Use Cases

- 📦 Product visualization for e-commerce
- 🎮 Game asset generation
- 🏗️ Architectural prototyping
- 🎨 Creative design exploration
- 🖨️ 3D printing from images
- 🧬 Scientific model generation

## ⚠️ Important Notes

- Images work best with **clear subjects on white/neutral backgrounds**
- Complex or detailed images may take longer to process
- HuggingFace queue might be busy during peak hours (just retry!)
- Generated models are suitable for 3D printing but may need post-processing

## 🔗 Links

- **Website:** Will be at your Vercel deployment URL
- **HuggingFace Spaces:** https://huggingface.co/spaces/tencent/Hunyuan3D-2.1
- **Bambu Lab:** https://bambulab.com
- **Bambu Studio:** https://github.com/bambulab/BambuStudio

## 📄 License

MIT License - Feel free to use and modify

## 🙏 Credits

- **Hunyuan3D:** Tencent Research
- **HuggingFace:** Free GPU hosting
- **Vercel:** Free static hosting
- **Bambu Lab:** Great 3D printer ecosystem

## 📞 Support

For issues or questions:
1. Check the error message displayed in the app
2. Try uploading a different image
3. Refresh the page and try again
4. Check HuggingFace Spaces status

## 🚀 Version History

**v1.0.0** (2026-02-14)
- Initial release
- Image-to-3D conversion
- Slicing configuration
- Bambu Studio integration

---

**Ready to print? Let's go! 🖨️✨**
