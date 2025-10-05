const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withCustomAndroidManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    
    // Add fullscreen and hide navigation bar
    const mainActivity = androidManifest.application[0].activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );
    
    if (mainActivity) {
      mainActivity.$['android:windowSoftInputMode'] = 'adjustResize';
    }
    
    return config;
  });
};
