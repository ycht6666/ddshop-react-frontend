import { useState, useEffect } from 'react'
import styles from '@/styles/coupon/coupon.module.css'
import UserLayout from '@/components/layout/user-layout'
import CouponUnusedCard from '@/components/coupon/coupon-unused-card'
import CouponUsedCard from '@/components/coupon/coupon-used-card'
import CouponSelect from '@/components/coupon/coupon-select'
// import couponData from '@/data/Coupon.json' //模擬後端json
// import couponSendManagementData from '@/data/Coupon_Send_Management.json' //模擬後端json

export default function Coupon() {
  const [selectedCouponType, setSelectedCouponType] = useState('全部優惠劵') //選擇的優惠券類型
  const [status, setStatus] = useState('unused') // 優惠券的使用狀態
  const [couponData, setCouponData] = useState([]) //優惠券的資料

  useEffect(() => {
    fetchCouponData()
  }, [])

  const fetchCouponData = async () => {
    // 從localStorage的userIdLocalStorage中取出user.id資料
    const userIdLocalStorage = JSON.parse(
      localStorage.getItem('userIdLocalStorage')
    )

    try {
      const response = await fetch(
        `http://localhost:3005/api/coupon-send-management/${userIdLocalStorage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const responseData = await response.json() // 解析數據
      // 處理響應
      if (responseData.status === 'success') {
        const couponSendManagementData =
          responseData.data.coupon_send_management
        setCouponData(couponSendManagementData)
        // console.log('從後端接收到的數據：', responseData) // 在控制台console.log接收到的數據
        // console.log('從後端接收到的數據：', couponSendManagementData) // 在控制台console.log接收到的數據
      } else {
        console.warn('請求失敗')
      }
    } catch (error) {
      console.error('發送請求時出錯：', error)
    }
  }

  // 提取所有未使用的 coupon_type
  const unusedCouponTypes = [
    '全部優惠劵',
    ...new Set(
      couponData
        .filter((coupon) => coupon.usage_status === '未使用')
        .map((coupon) => coupon.name.substring(8))
    ),
  ]

  // 提取所有已使用的 coupon_type
  const usedCouponTypes = [
    '全部優惠劵',
    ...new Set(
      couponData
        .filter((coupon) => coupon.usage_status === '已使用')
        .map((coupon) => coupon.name.substring(8))
    ),
  ]

  // 根據優惠券的使用狀態和所選擇的優惠券類型來篩選優惠券資料
  const filteredCoupons =
    status === 'unused' // 判斷目前的狀態是否為 'unused'（未使用）
      ? selectedCouponType === '全部優惠劵' // 如果狀態為 'unused'，進一步判斷所選擇的優惠券類型是否為 '全部優惠劵'
        ? couponData.filter((coupon) => coupon.usage_status === '未使用') // 如果所選擇的優惠券類型為 '全部優惠劵'，則篩選出所有 usage_status 為 '未使用' 的優惠券
        : couponData.filter(
            (coupon) =>
              coupon.usage_status === '未使用' && // 如果所選擇的優惠券類型不是 '全部優惠劵'，則篩選出 usage_status 為 '未使用' 的同時，name 的後 8 個字為所選擇的優惠券類型的優惠券
              coupon.name.substring(8) === selectedCouponType
          )
      : selectedCouponType === '全部優惠劵' // 如果狀態不是 'unused'，則判斷所選擇的優惠券類型是否為 '全部優惠劵'
      ? couponData.filter((coupon) => coupon.usage_status === '已使用') // 如果所選擇的優惠券類型為 '全部優惠劵'，則篩選出所有 usage_status 為 '已使用' 的優惠券
      : couponData.filter(
          (coupon) =>
            coupon.usage_status === '已使用' && // 如果所選擇的優惠券類型不是 '全部優惠劵'，則篩選出 usage_status 為 '已使用' 的同時，name 的後 8 個字為所選擇的優惠券類型的優惠券
            coupon.name.substring(8) === selectedCouponType
        )

  // 切換狀態函數
  const toggleStatus = () => {
    // 如果當前狀態是未使用，就切换到已使用狀態
    if (status === 'unused') {
      setStatus('used')
      setSelectedCouponType('全部優惠劵') // 切換狀態時重置選擇的 coupon_type
    }
    // 如果當前狀態是已使用，就切换到未使用狀態
    if (status === 'used') {
      setStatus('unused')
      setSelectedCouponType('全部優惠劵') // 切換狀態時重置選擇的 coupon_type
    }
  }

  return (
    <>
      <main className={`${styles['coupon']} d-flex justify-content-center`}>
        <div
          className={`${styles['outerFrame']} w-100 d-flex border-ddprimary mb-4`}
        >
          <div className={`${styles['use']} bg-ddprimary`}>
            {/* 渲染未使用按鈕 */}
            <button onClick={status === 'used' ? toggleStatus : null}>
              <h2
                className={
                  // 根據當前狀態動態設置文本樣式
                  status === 'unused' ? styles['unused'] : styles['used']
                }
              >
                可使用
              </h2>
            </button>
            {/* 分隔線 */}
            <div className={styles['dottedLine']} />
            {/* 渲染已使用按鈕 */}
            <button onClick={status === 'unused' ? toggleStatus : null}>
              <h2
                className={
                  // 根據當前狀態動態設置文本樣式
                  status === 'unused' ? styles['used'] : styles['unused']
                }
              >
                已失效
              </h2>
            </button>
          </div>
          <CouponSelect
            selectedCouponType={selectedCouponType}
            setSelectedCouponType={setSelectedCouponType}
            availableCouponTypes={
              status === 'unused'
                ? [
                    '全部優惠劵',
                    ...unusedCouponTypes
                      .slice(1)
                      .sort((a, b) => b.length - a.length),
                  ]
                : [
                    '全部優惠劵',
                    ...usedCouponTypes
                      .slice(1)
                      .sort((a, b) => b.length - a.length),
                  ]
            }
          />
          <div className={styles['coupons']}>
            {filteredCoupons.map((coupon) =>
              // 根據狀態選擇不同的優惠券卡片元件
              status === 'unused' ? (
                <CouponUnusedCard
                  key={coupon.id}
                  name={coupon.name}
                  money={coupon.money}
                  startDate={coupon.starting_time}
                  endDate={coupon.end_time}
                />
              ) : (
                <CouponUsedCard
                  key={coupon.id}
                  name={coupon.name}
                  money={coupon.money}
                  startDate={coupon.starting_time}
                  endDate={coupon.end_time}
                />
              )
            )}
          </div>
          <img
            src="../images/coupon/index_img_averagesaving-2.png"
            alt=""
            className={styles['smallIcon']}
          />
        </div>
      </main>
    </>
  )
}

// 這裡代表要套用UserLayout，取代原本的DefaultLayout
// 要寫在元件的函式之外
Coupon.getLayout = function (page) {
  return <UserLayout>{page}</UserLayout>
}
