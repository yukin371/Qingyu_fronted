module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue'
  ],
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html'
    },
    {
      files: ['src/style.css', 'src/styles/**/*.scss'],
      rules: {
        // Prevent global icon selector pollution.
        'selector-disallowed-list': ['/^svg$/', '/^i$/', '/^\\.el-icon$/']
      }
    }
  ],
  rules: {
    'at-rule-no-deprecated': null
  }
}
