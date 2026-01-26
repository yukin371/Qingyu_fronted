<template>
  <div class="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Qingyu Design System Components
        </h1>
        <p class="text-slate-600 text-lg">Phase 1: Basic Components Demo</p>
        <div class="mt-4 flex justify-center">
          <ThemeSwitcher />
        </div>
      </div>

      <!-- QyButton Demo -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyButton</h2>
        <QyCard>
          <div class="space-y-8">
            <!-- Variants -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Variants</h3>
              <div class="flex flex-wrap gap-4">
                <QyButton variant="primary">Primary</QyButton>
                <QyButton variant="secondary">Secondary</QyButton>
                <QyButton variant="danger">Danger</QyButton>
                <QyButton variant="ghost">Ghost</QyButton>
              </div>
            </div>

            <!-- Sizes -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Sizes</h3>
              <div class="flex flex-wrap items-center gap-4">
                <QyButton size="sm">Small</QyButton>
                <QyButton size="md">Medium</QyButton>
                <QyButton size="lg">Large</QyButton>
              </div>
            </div>

            <!-- States -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">States</h3>
              <div class="flex flex-wrap gap-4">
                <QyButton :loading="true">Loading</QyButton>
                <QyButton :disabled="true">Disabled</QyButton>
                <QyButton @click="handleButtonClick">Click Me</QyButton>
              </div>
            </div>

            <!-- Combinations -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Variant + Size Combinations</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QyButton variant="primary" size="sm">Primary Sm</QyButton>
                <QyButton variant="primary" size="md">Primary Md</QyButton>
                <QyButton variant="primary" size="lg">Primary Lg</QyButton>
                <QyButton variant="secondary" size="md">Secondary</QyButton>
                <QyButton variant="danger" size="sm">Danger Sm</QyButton>
                <QyButton variant="danger" size="md">Danger Md</QyButton>
                <QyButton variant="ghost" size="md">Ghost</QyButton>
                <QyButton variant="ghost" size="lg">Ghost Lg</QyButton>
              </div>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- QyCard Demo -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyCard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Basic Card -->
          <QyCard>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Basic Card</h3>
            <p class="text-slate-600">This is a basic card with default styling and shadow.</p>
          </QyCard>

          <!-- Card with Title and Footer -->
          <QyCard>
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">Card with Title & Footer</h3>
            </template>
            <p class="text-slate-600 mb-4">This card has custom title and footer slots.</p>
            <template #footer>
              <div class="flex justify-between">
                <QyButton variant="ghost" size="sm">Cancel</QyButton>
                <QyButton size="sm">Action</QyButton>
              </div>
            </template>
          </QyCard>

          <!-- Hoverable Card -->
          <QyCard hoverable @click="handleCardClick">
            <h3 class="text-xl font-bold text-slate-800 mb-2">Hoverable Card</h3>
            <p class="text-slate-600">Hover over this card to see the effect. Click to trigger action.</p>
          </QyCard>

          <!-- Card without Shadow -->
          <QyCard :shadow="false">
            <h3 class="text-xl font-bold text-slate-800 mb-2">No Shadow</h3>
            <p class="text-slate-600">This card has shadow disabled.</p>
          </QyCard>

          <!-- Rich Content Card -->
          <QyCard class="md:col-span-2">
            <template #title>
              <h3 class="text-xl font-bold text-slate-800">Rich Content Card</h3>
            </template>
            <div class="space-y-4">
              <p class="text-slate-600">Cards can contain any content including lists, images, and more.</p>
              <ul class="list-disc list-inside text-slate-600 space-y-1">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>
            </div>
            <template #footer>
              <div class="flex justify-end gap-2">
                <QyButton variant="secondary">Learn More</QyButton>
                <QyButton>Get Started</QyButton>
              </div>
            </template>
          </QyCard>
        </div>
      </section>

      <!-- QyInput Demo -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyInput</h2>
        <QyCard>
          <div class="space-y-6">
            <!-- Text Input -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Text Input</h3>
              <div class="max-w-md">
                <QyInput
                  v-model="textInput"
                  type="text"
                  placeholder="Enter text..."
                />
                <p class="mt-2 text-sm text-slate-500">Value: {{ textInput }}</p>
              </div>
            </div>

            <!-- Search Input -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Search Input</h3>
              <div class="max-w-md">
                <QyInput
                  v-model="searchInput"
                  type="search"
                  placeholder="Search..."
                />
                <p class="mt-2 text-sm text-slate-500">Value: {{ searchInput }}</p>
              </div>
            </div>

            <!-- Textarea -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Textarea</h3>
              <div class="max-w-md">
                <QyInput
                  v-model="textareaInput"
                  type="textarea"
                  placeholder="Write a message..."
                  :rows="4"
                />
                <p class="mt-2 text-sm text-slate-500">Value: {{ textareaInput }}</p>
              </div>
            </div>

            <!-- Disabled State -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Disabled State</h3>
              <div class="max-w-md">
                <QyInput
                  v-model="disabledInput"
                  placeholder="This input is disabled"
                  disabled
                />
              </div>
            </div>

            <!-- Input with Events -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Input with Events</h3>
              <div class="max-w-md">
                <QyInput
                  v-model="eventInput"
                  type="text"
                  placeholder="Focus and blur to see events"
                  @focus="handleFocus"
                  @blur="handleBlur"
                />
                <p class="mt-2 text-sm text-slate-500">Last event: {{ lastEvent }}</p>
              </div>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- QyBadge Demo -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyBadge</h2>
        <QyCard>
          <div class="space-y-8">
            <!-- Count Badges -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Count Badges</h3>
              <div class="flex flex-wrap items-center gap-6">
                <div class="flex items-center gap-2">
                  <QyBadge type="count" :value="5" color="cyan" />
                  <span class="text-sm text-slate-600">Cyan (5)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="count" :value="10" color="blue" />
                  <span class="text-sm text-slate-600">Blue (10)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="count" :value="3" color="green" />
                  <span class="text-sm text-slate-600">Green (3)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="count" :value="150" :max="99" color="red" />
                  <span class="text-sm text-slate-600">Red (150+)</span>
                </div>
                <div class="flex items-center gap-2">
                  <QyBadge type="count" :value="7" color="yellow" />
                  <span class="text-sm text-slate-600">Yellow (7)</span>
                </div>
              </div>
            </div>

            <!-- Status Badges -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Status Badges</h3>
              <div class="flex flex-wrap gap-4">
                <QyBadge type="status" text="Active" color="green" />
                <QyBadge type="status" text="Pending" color="yellow" />
                <QyBadge type="status" text="Inactive" color="red" />
                <QyBadge type="status" text="Processing" color="blue" />
                <QyBadge type="status" text="New" color="cyan" />
                <QyBadge type="status" color="purple">
                  Custom
                </QyBadge>
              </div>
            </div>

            <!-- Dot Badges -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Dot Badges</h3>
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-slate-600 mb-2">Different Sizes:</p>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="cyan" dotSize="sm" />
                      <span class="text-sm text-slate-600">Small</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="blue" dotSize="md" />
                      <span class="text-sm text-slate-600">Medium</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="green" dotSize="lg" />
                      <span class="text-sm text-slate-600">Large</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p class="text-sm text-slate-600 mb-2">Different Colors:</p>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="cyan" />
                      <span class="text-sm text-slate-600">Online</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="yellow" />
                      <span class="text-sm text-slate-600">Away</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="red" />
                      <span class="text-sm text-slate-600">Offline</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <QyBadge type="dot" color="purple" />
                      <span class="text-sm text-slate-600">Busy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Badge on Button -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Badge on Button</h3>
              <div class="flex flex-wrap gap-4">
                <div class="relative inline-block">
                  <QyButton>Notifications</QyButton>
                  <div class="absolute -top-2 -right-2">
                    <QyBadge type="count" :value="5" color="red" />
                  </div>
                </div>
                <div class="relative inline-block">
                  <QyButton variant="secondary">Messages</QyButton>
                  <div class="absolute -top-2 -right-2">
                    <QyBadge type="count" :value="99" :max="99" color="cyan" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- QyAvatar Demo -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">QyAvatar</h2>
        <QyCard>
          <div class="space-y-8">
            <!-- Image Avatars -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Image Avatars</h3>
              <div class="flex flex-wrap items-center gap-4">
                <div class="text-center">
                  <QyAvatar type="image" src="https://i.pravatar.cc/150?img=1" alt="User 1" size="sm" />
                  <p class="text-xs text-slate-500 mt-1">Small</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="image" src="https://i.pravatar.cc/150?img=2" alt="User 2" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Medium</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="image" src="https://i.pravatar.cc/150?img=3" alt="User 3" size="lg" />
                  <p class="text-xs text-slate-500 mt-1">Large</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="image" size="md" />
                  <p class="text-xs text-slate-500 mt-1">No Image</p>
                </div>
              </div>
            </div>

            <!-- Text Avatars -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Text Avatars</h3>
              <div class="flex flex-wrap items-center gap-4">
                <div class="text-center">
                  <QyAvatar type="text" text="John Doe" color="cyan" size="sm" />
                  <p class="text-xs text-slate-500 mt-1">Cyan</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="Jane Smith" color="blue" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Blue</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="Bob Wilson" color="green" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Green</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="Alice Brown" color="purple" size="lg" />
                  <p class="text-xs text-slate-500 mt-1">Purple</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="Charlie" color="red" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Red</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="Diana" color="yellow" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Yellow</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="Eve" color="pink" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Pink</p>
                </div>
              </div>
            </div>

            <!-- Group Avatar -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Group Avatars</h3>
              <div class="flex flex-wrap items-center gap-6">
                <div>
                  <QyAvatar
                    type="group"
                    size="md"
                    :avatars="[
                      { src: 'https://i.pravatar.cc/150?img=4', alt: 'User 1' },
                      { src: 'https://i.pravatar.cc/150?img=5', alt: 'User 2' },
                      { src: 'https://i.pravatar.cc/150?img=6', alt: 'User 3' }
                    ]"
                  />
                  <p class="text-xs text-slate-500 mt-1">3 avatars</p>
                </div>
                <div>
                  <QyAvatar
                    type="group"
                    size="md"
                    :avatars="[
                      { src: 'https://i.pravatar.cc/150?img=7', alt: 'User 1' },
                      { src: 'https://i.pravatar.cc/150?img=8', alt: 'User 2' },
                      { src: 'https://i.pravatar.cc/150?img=9', alt: 'User 3' },
                      { src: 'https://i.pravatar.cc/150?img=10', alt: 'User 4' },
                      { src: 'https://i.pravatar.cc/150?img=11', alt: 'User 5' }
                    ]"
                  />
                  <p class="text-xs text-slate-500 mt-1">5 avatars (shows +2)</p>
                </div>
                <div>
                  <QyAvatar
                    type="group"
                    size="lg"
                    :avatars="[
                      { text: 'John Doe' },
                      { text: 'Jane Smith' },
                      { text: 'Bob Wilson' },
                      { text: 'Alice Brown' }
                    ]"
                  />
                  <p class="text-xs text-slate-500 mt-1">Text avatars</p>
                </div>
              </div>
            </div>

            <!-- Avatar Sizes -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Size Comparison</h3>
              <div class="flex items-end gap-6">
                <div class="text-center">
                  <QyAvatar type="text" text="SM" color="cyan" size="sm" />
                  <p class="text-xs text-slate-500 mt-1">Small (32px)</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="MD" color="cyan" size="md" />
                  <p class="text-xs text-slate-500 mt-1">Medium (48px)</p>
                </div>
                <div class="text-center">
                  <QyAvatar type="text" text="LG" color="cyan" size="lg" />
                  <p class="text-xs text-slate-500 mt-1">Large (64px)</p>
                </div>
              </div>
            </div>

            <!-- Interactive Avatar -->
            <div>
              <h3 class="text-lg font-semibold text-slate-700 mb-4">Interactive Avatar</h3>
              <div class="flex items-center gap-4">
                <QyAvatar
                  type="image"
                  src="https://i.pravatar.cc/150?img=12"
                  alt="Clickable Avatar"
                  size="lg"
                  @click="handleAvatarClick"
                />
                <div>
                  <p class="font-semibold text-slate-800">Click the avatar!</p>
                  <p class="text-sm text-slate-500">Click count: {{ avatarClickCount }}</p>
                </div>
              </div>
            </div>
          </div>
        </QyCard>
      </section>

      <!-- Component Combinations -->
      <section class="mb-16">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Component Combinations</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- User Card -->
          <QyCard hoverable>
            <template #title>
              <div class="flex items-center gap-4">
                <QyAvatar
                  type="image"
                  src="https://i.pravatar.cc/150?img=20"
                  alt="User"
                  size="lg"
                />
                <div>
                  <h3 class="text-xl font-bold text-slate-800">John Doe</h3>
                  <p class="text-sm text-slate-500">Software Engineer</p>
                </div>
              </div>
            </template>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-slate-600">Status</span>
                <QyBadge type="status" text="Active" color="green" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600">Projects</span>
                <QyBadge type="count" :value="12" color="blue" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600">Tasks</span>
                <QyBadge type="count" :value="5" color="cyan" />
              </div>
            </div>
            <template #footer>
              <div class="flex gap-2">
                <QyButton variant="secondary" size="sm">Message</QyButton>
                <QyButton size="sm">View Profile</QyButton>
              </div>
            </template>
          </QyCard>

          <!-- Comment Card -->
          <QyCard>
            <template #title>
              <div class="flex items-center gap-3">
                <QyAvatar type="text" text="JD" color="purple" size="md" />
                <div>
                  <h3 class="text-lg font-bold text-slate-800">Jane Doe</h3>
                  <p class="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
            </template>
            <QyInput
              v-model="commentText"
              type="textarea"
              placeholder="Write a comment..."
              :rows="3"
            />
            <template #footer>
              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  <QyBadge type="dot" color="green" />
                  <span class="text-sm text-slate-500">Online</span>
                </div>
                <div class="flex gap-2">
                  <QyButton variant="ghost" size="sm">Cancel</QyButton>
                  <QyButton size="sm">Post</QyButton>
                </div>
              </div>
            </template>
          </QyCard>
        </div>
      </section>

      <!-- Footer -->
      <footer class="text-center text-slate-500 text-sm py-8 border-t border-slate-200">
        <p>Qingyu Design System - Phase 1 Basic Components</p>
        <p class="mt-1">Built with Vue 3 + TypeScript + Tailwind CSS</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  QyButton,
  QyCard,
  QyInput,
  QyBadge,
  QyAvatar
} from '@/design-system/components'
import ThemeSwitcher from '@/design-system/other/ThemeSwitcher.vue'

// Input refs
const textInput = ref('')
const searchInput = ref('')
const textareaInput = ref('')
const disabledInput = ref('Cannot edit this')
const eventInput = ref('')
const lastEvent = ref('None')

// Avatar click count
const avatarClickCount = ref(0)

// Comment text
const commentText = ref('')

// Event handlers
const handleButtonClick = () => {
  alert('Button clicked!')
}

const handleCardClick = () => {
  alert('Card clicked!')
}

const handleFocus = () => {
  lastEvent.value = 'Focus'
}

const handleBlur = () => {
  lastEvent.value = 'Blur'
}

const handleAvatarClick = () => {
  avatarClickCount.value++
}
</script>
