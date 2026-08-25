import React, { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'qw_demo_state_v1'

const defaultState = {
  auth: null, // { name, email } — optional; the app works without an account
  profile: null, // { gender, age, weight, weightUnit, goal }
  progress: {}, // { [dayId]: { completedAt } }
  foodLog: {}, // { [dateKey]: [{ id, dishId, name, emoji, servingMultiplier, calories, protein, carbs, fat, fiber, photo, loggedAt }] }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return defaultState
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const signIn = (auth) => setState((s) => ({ ...s, auth }))

  const signOut = () => setState((s) => ({ ...s, auth: null }))

  const saveProfile = (profile) =>
    setState((s) => ({ ...s, profile: { ...s.profile, ...profile } }))

  const completeDay = (dayId) =>
    setState((s) => ({
      ...s,
      progress: { ...s.progress, [dayId]: { completedAt: new Date().toISOString() } },
    }))

  const logMeal = (dateKey, entry) =>
    setState((s) => ({
      ...s,
      foodLog: { ...s.foodLog, [dateKey]: [...(s.foodLog[dateKey] || []), entry] },
    }))

  const deleteMeal = (dateKey, entryId) =>
    setState((s) => ({
      ...s,
      foodLog: { ...s.foodLog, [dateKey]: (s.foodLog[dateKey] || []).filter((e) => e.id !== entryId) },
    }))

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
  }

  const value = {
    ...state,
    signIn,
    signOut,
    saveProfile,
    completeDay,
    logMeal,
    deleteMeal,
    resetDemo,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
