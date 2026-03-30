# Element Locator Prompt

## Context
当前页面：{pageUrl}
页面标题：{pageTitle}

## Page Elements
[Start of page]
{elements}
[End of page]

## Target
找到符合描述的元素：{targetDescription}

## Instructions
1. Only elements with numeric indexes in [ ] are interactive
2. (stacked) indentation (with \t) is important and means that the element is a(html) child of the element above(with a lower index)
3. Elements with \* are new elements that were added after the previous step(if url has not changed)
4. 优先使用 data-testid、role、aria-label 等语义属性
5. 避免使用绝对 xpath，优先相对路径
6. 返回置信度高于 0.8 的选择器

## Output Format
返回JSON格式：
{
  "selector": "CSS选择器或XPath",
  "confidence": 0.95,
  "reasoning": "选择理由",
  "alternativeSelectors": ["备选1", "备选2"]
}

## Selector Priority
1. [data-testid="..."] - 最稳定，专为测试设计
2. [role="..."][aria-label="..."] - 语义化和可访问
3. [aria-label="..."] - 可访问标签
4. tag[data-*] 或 tag[attribute] - 带特定属性的元素
5. text="..." 或 :has-text("...") - 文本内容
6. nth-child 或 nth-of-type - 位置（最后手段）

## Common Patterns
- 按钮: button, [role="button"], input[type="submit"]
- 链接: a[href], [role="link"]
- 输入框: input, textarea, [role="textbox"]
- 下拉框: select, [role="combobox"]
- 复选框: input[type="checkbox"], [role="checkbox"]
- 单选框: input[type="radio"], [role="radio"]
- 对话框: [role="dialog"], dialog
- 菜单: [role="menu"], [role="menuitem"]

## Spatial Relationships
- "below" / "above" - 垂直位置关系
- "after" / "before" - 水平位置关系（同一父元素内）
- "inside" / "within" - 包含关系
- "next to" / "adjacent to" - 兄弟元素关系
- "in the footer" / "in the header" - 区域关系

## Example
输入: "登录按钮"
输出:
{
  "selector": "button[type='submit']:has-text('登录')",
  "confidence": 0.92,
  "reasoning": "使用button标签和type属性定位，has-text确保文本匹配",
  "alternativeSelectors": [
    "button.primary",
    "[data-testid='login-submit']",
    "//button[contains(@class, 'login')]"
  ]
}
