import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { signInRequest } from '../apis/index.js';
import FindpasswordForm from '../Modals/findpassword';
import SignUpinfoForm from '../Modals/Signupinfo';
import MyModal from '../MyModal';
import './modules.css';


const LoginForm = ({ onLogin }) => {

  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserpassword] = useState('');
  const [error, setError] = useState(false);
  const [modalOpenfind, setModalOpenfind] = useState(false);
  const [modalOpeninfo, setModalOpeninfo] = useState(false);
  const [cookies, setCookie] = useCookies(['accessToken']);
  const [modalOpenin, setModalOpenin] = useState(true);
  const navigator = useNavigate();

  const onSignInButtonClickHandler = (e) => {
    e.preventDefault();
    const requestBody = { email: userEmail, password: userPassword };
    signInRequest(requestBody)
      .then(response => {
        signInResponse(response);
      })
      .catch(error => {
        alert('로그인 요청 중 오류가 발생했습니다.');
        setError(true);
        onLogin(false);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'button') {
      onSignInButtonClickHandler(e);
    }
  };

  const handleFindpassword = (e) => {
    e.preventDefault();
    setModalOpenin(false);
    setModalOpenfind(true);
  };

  const handleSignupinfo = (e) => {
    e.preventDefault();
    setModalOpenin(false);
    setModalOpeninfo(true);
  };

  const signInResponse = (responseBody) => {
    if (!responseBody) {
      console.error('서버로부터 응답을 받지 못했습니다.');
      alert('네트워크 이상입니다.');
      setError(true);
      onLogin(false);
      return;
    }

    const { code, token, expirationTime } = responseBody;

    if (code === 'SU') {
      if (token && expirationTime) {
        const now = new Date().getTime();
        const expires = new Date(now + expirationTime * 1000);
        setCookie('accessToken', token, { expires, path: '/' });
        onLogin(true);
        setModalOpenin(false);
        window.location.reload();
      } else {
        console.error('토큰 또는 만료 시간이 제공되지 않았습니다.');
        setError(true);
        onLogin(false);
      }
    } else {
      setError(true);
      if (code === 'DBE') {
        alert('데이터베이스 오류입니다.');
      } else if (code === 'SF') {
        alert('로그인 실패입니다.\n 이메일 또는 비밀번호를 확인해주세요.');
      } else if (code === 'VF') {
        alert('로그인 실패입니다.');
      } else {
        alert('네트워크 오류입니다.');
      }
    }
  };

  const onSignUpSuccess = (success) => {
    if (success) {
      setModalOpeninfo(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="loginHeaderContainer">
        <img src="header-name.png" alt="로그인 로고" className="responsiveLogo" />
      </div>
      <div className="loginFormContainer">
        <input
          type="text"
          value={userEmail}
          onChange={e => setUserEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="학교 이메일을 입력해주세요."
        />
      </div>

      <div className="login_passwordCss">
        <input
          type="password"
          value={userPassword}
          onChange={e => setUserpassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="비밀번호를 입력해주세요."
        />
      </div>
      {error &&
        <div className='auth-sign-in-erro-box'>
          <div className='auth-sign-in-error-message'>
            {'이메일 주소 또는 비밀번호를 잘못 입력했습니다.\n입력하신 내용을 다시 확인해주세요.'}
          </div>
        </div>
      }
      <button className="findPasswordButton" onClick={handleFindpassword}>비밀번호 재설정</button>
      <button type="submit" className="loginButton" onClick={onSignInButtonClickHandler}>로그인</button>
      <div className="signupPrompt">
        <p>아직 회원이 아니신가요?</p>
        <button className="signUpButton_Login" onClick={handleSignupinfo}>회원가입</button>
      </div>

      <MyModal
        open={modalOpenfind}
        width={500}
        header={[]}
        onCancel={e => setModalOpenfind(false)}
        footer={[]}
      >
        <FindpasswordForm onLogin={handleFindpassword} onClose={() => setModalOpenfind(false)} />
      </MyModal>

      <MyModal
        open={modalOpeninfo}
        onCancel={e => setModalOpeninfo(false)}
        header={[]}
        footer={[]}
      >
        <SignUpinfoForm onSignUpForm={onSignUpSuccess} />
      </MyModal>
    </form>
  );
};

export default LoginForm;