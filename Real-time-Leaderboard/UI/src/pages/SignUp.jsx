import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/auth'
import '../styles/SignUp.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    // Clear error when user starts typing
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

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (formData.password.length < 3) {
      newErrors.password = 'Mật khẩu phải có ít nhất 3 ký tự'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
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
      console.log('Attempting registration with:', formData.username)
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      console.log('Registration response:', response)
      
      if (response.success) {
        console.log('Registration successful')
        navigate('/sign-in', { 
          state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' }
        })
      } else {
        console.log('Registration failed:', response.message)
        setErrors({ general: response.message || 'Đăng ký thất bại' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: error.message || 'Có lỗi xảy ra khi đăng ký' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="signup">
      <div className="signup__wrap">
        <div className="signup__card">
          <div className="signup__header">
            <h1 className="signup__title">Đăng Ký</h1>
            <p className="signup__subtitle">Tạo tài khoản mới để bắt đầu!</p>
          </div>

          {errors.general && (
            <div className="error__message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}

          <form className="signup__form" onSubmit={handleSubmit}>
            <div className="form__row">
              <div className="form__group">
                <label htmlFor="username" className="form__label">Tên đăng nhập</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form__input ${errors.username ? 'error' : ''}`}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
                {errors.username && <span className="error__message">{errors.username}</span>}
              </div>

              <div className="form__group">
                <label htmlFor="email" className="form__label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form__input ${errors.email ? 'error' : ''}`}
                  placeholder="Nhập email"
                  required
                />
                {errors.email && <span className="error__message">{errors.email}</span>}
              </div>
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

            <div className="form__group">
              <label htmlFor="confirmPassword" className="form__label">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form__input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Nhập lại mật khẩu"
                required
              />
              {errors.confirmPassword && <span className="error__message">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn--primary" disabled={isLoading}>
              {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
          </form>

          <div className="signup__footer">
            <p className="signup__text">
              Đã có tài khoản? 
              <Link to="/sign-in" className="signup__link">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
