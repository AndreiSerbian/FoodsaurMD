
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../integrations/supabase/client'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        checkUserRole(session.user.id)
      }
      setLoading(false)
    })

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          checkUserRole(session.user.id)
        } else {
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (data && !error) {
        setUserRole(data.role)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }

  const signUp = async (email, password, brandName, phone) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            brand_name: brandName,
            phone: phone
          }
        }
      })

      if (error) throw error

      // Создаем профиль производителя после регистрации
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          user: data.user, 
          needsConfirmation: true,
          message: 'Проверьте вашу почту для подтверждения регистрации' 
        }
      }

      return { user: data.user, needsConfirmation: false }
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Проверяем, что email подтвержден
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        throw new Error('Email не подтвержден. Проверьте вашу почту.')
      }

      return { user: data.user }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUserRole(null)
    } catch (error) {
      throw error
    }
  }

  const createProducerProfile = async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('producer_profiles')
        .insert([{
          user_id: user.id,
          brand_name: profileData.brand_name,
          phone: profileData.phone,
          address: profileData.address,
          description: profileData.description,
          email_verified: true
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    createProducerProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
