import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/SignIn.css'
import { login, setToken, setUser } from '../services/auth'

export default function SignIn() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      console.log('Attempting login with:', formData.username)
      const response = await login(formData.username, formData.password)
      console.log('Login response:', response)
      
      if (response.success) {
        // Persist user and auth state
        if (response.data) {
          setUser(response.data)
        }
        // Backend currently returns user object without token, so set a placeholder token
        setToken(response.data?.token || 'logged-in')
        navigate('/home')
      } else {
        console.log('Login failed:', response.message)
        setErrors({ general: response.message || 'Đăng nhập thất bại' })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ general: error.message || 'Có lỗi xảy ra khi đăng nhập' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="signin">
      <div className="signin__wrap">
        <div className="signin__card">
          <div className="signin__header">
            <h1 className="signin__title">Đăng Nhập</h1>
            <p className="signin__subtitle">Chào mừng bạn quay trở lại!</p>
          </div>

          {errors.general && (
            <div className="error__message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}

          <form className="signin__form" onSubmit={handleSubmit}>
            <div className="form__group">
              <label htmlFor="username" className="form__label">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form__input ${errors.username ? 'error' : ''}`}
                placeholder="Nhập tên đăng nhập của bạn"
                required
              />
              {errors.username && <span className="error__message">{errors.username}</span>}
            </div>

            <div className="form__group">
              <label htmlFor="password" className="form__label">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form__input ${errors.password ? 'error' : ''}`}
                placeholder="Nhập mật khẩu"
                required
              />
              {errors.password && <span className="error__message">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="signin__footer">
            <p className="signin__text">
              Chưa có tài khoản? 
              <Link to="/sign-up" className="signin__link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}