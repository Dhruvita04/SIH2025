import React from 'react';

const ColorShowcase = () => {
  const colorPalette = [
    { name: 'Primary', colors: ['primary-50', 'primary-100', 'primary-200', 'primary-300', 'primary-400', 'primary-500', 'primary-600', 'primary-700', 'primary-800', 'primary-900'] },
    { name: 'Secondary', colors: ['secondary-50', 'secondary-100', 'secondary-200', 'secondary-300', 'secondary-400', 'secondary-500', 'secondary-600', 'secondary-700', 'secondary-800', 'secondary-900'] },
    { name: 'Accent', colors: ['accent-50', 'accent-100', 'accent-200', 'accent-300', 'accent-400', 'accent-500', 'accent-600', 'accent-700', 'accent-800', 'accent-900'] },
    { name: 'Warm', colors: ['warm-50', 'warm-100', 'warm-200', 'warm-300', 'warm-400', 'warm-500', 'warm-600', 'warm-700', 'warm-800', 'warm-900'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero py-16">
      <div className="container-max">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gradient-primary mb-4">
            Healthcare Harmony Color Palette
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A warm, professional color scheme designed specifically for healthcare applications, 
            featuring teal, coral, lavender, and warm yellow accents.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {colorPalette.map((palette) => (
            <div key={palette.name} className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 capitalize">
                {palette.name} Colors
              </h2>
              <div className="grid grid-cols-5 gap-4">
                {palette.colors.map((color) => (
                  <div key={color} className="text-center space-y-2">
                    <div className={`w-full h-20 rounded-xl bg-${color} shadow-lg border border-gray-200`}></div>
                    <p className="text-sm font-medium text-gray-600">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Button Showcase */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Button Variations
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-outline">Outline Button</button>
            <button className="btn-accent">Accent Button</button>
            <button className="btn-warm">Warm Button</button>
          </div>
        </div>

        {/* Card Showcase */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Card Variations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-primary p-8 text-center">
              <h3 className="text-xl font-bold text-primary-800 mb-4">Primary Card</h3>
              <p className="text-primary-600">This card uses the primary color scheme with teal gradients.</p>
            </div>
            <div className="card-secondary p-8 text-center">
              <h3 className="text-xl font-bold text-secondary-800 mb-4">Secondary Card</h3>
              <p className="text-secondary-600">This card uses the secondary color scheme with coral gradients.</p>
            </div>
            <div className="card-accent p-8 text-center">
              <h3 className="text-xl font-bold text-accent-800 mb-4">Accent Card</h3>
              <p className="text-accent-600">This card uses the accent color scheme with lavender gradients.</p>
            </div>
          </div>
        </div>

        {/* Gradient Text Showcase */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Gradient Text Variations
          </h2>
          <div className="text-center space-y-4">
            <h3 className="text-4xl font-bold text-gradient-primary">Primary Gradient Text</h3>
            <h3 className="text-4xl font-bold text-gradient-secondary">Secondary Gradient Text</h3>
            <h3 className="text-4xl font-bold text-gradient-accent">Accent Gradient Text</h3>
          </div>
        </div>

        {/* Background Patterns */}
        <div className="mt-16 space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Background Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-32 bg-pattern rounded-2xl flex items-center justify-center">
              <span className="text-lg font-semibold text-primary-700">Primary Pattern</span>
            </div>
            <div className="h-32 bg-pattern-dots rounded-2xl flex items-center justify-center">
              <span className="text-lg font-semibold text-secondary-700">Secondary Pattern</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorShowcase;
