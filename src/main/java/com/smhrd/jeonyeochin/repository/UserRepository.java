package com.smhrd.jeonyeochin.repository;
import com.smhrd.jeonyeochin.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

}